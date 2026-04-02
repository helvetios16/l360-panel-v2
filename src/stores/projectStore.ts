import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'
import { db } from '@/firebase/config'
import { ref as dbRef, onValue, get, type Unsubscribe } from 'firebase/database'

export type AvailabilityStatus = 'blocked' | 'available' | 'reserved' | 'sold'

export interface Timestamp {
	seconds: number
	nanoseconds: number
}

export interface Unit {
	id: string
	block: string
	lot: string
	status: AvailabilityStatus
	updated_at?: Timestamp | number
	price?: number
	area?: number
	[key: string]: unknown
}

export interface Project {
	id: string
	name: string
	client: string
	description: string
	typeProject: string
	dbKey: string
	url: string
	thumbnailUrl: string
	maintenanceMode: boolean
	totalUnits: number
	availableUnits: number
	image: string
	units: Unit[]
	availabilityConfig?: Record<string, boolean>
	updated_at?: Timestamp | number
}

export const useProjectStore = defineStore('project', () => {
	const projects = ref<Project[]>([])
	const currentProject = ref<Project | null>(null)
	const isLoading = ref(false)
	const error = ref<string | null>(null)
	let unsubscribe: Unsubscribe | null = null

	function parseUnits(data: unknown): Unit[] {
		if (!data) return []
		if (Array.isArray(data)) return data as Unit[]
		return Object.entries(data as Record<string, unknown>).map(([id, val]) => ({
			...(val as Record<string, unknown>),
			id: ((val as Record<string, unknown>).id as string) || id,
		})) as Unit[]
	}

	async function fetchProjects() {
		isLoading.value = true
		error.value = null
		try {
			const response = await api.getProjects()
			const data = response.data as unknown as Record<string, unknown>
			const rawProjects =
				(data.projects as Project[]) || (Array.isArray(data) ? (data as Project[]) : [])

			// Fetch units from RTDB for each project
			const enriched = await Promise.all(
				rawProjects.map(async (p) => {
					const typeProject = encodeURIComponent(p.typeProject || 'lotizer')
					const dbKey = encodeURIComponent(p.dbKey || p.id)
					const path = `v2/${typeProject}/${dbKey}/data/availability`
					try {
						const snapshot = await get(dbRef(db, path))
						const units = parseUnits(snapshot.val())
						return {
							...p,
							units,
							totalUnits: units.length,
							availableUnits: units.filter((u) => u.status === 'available').length,
						}
					} catch {
						return { ...p, units: [], totalUnits: 0, availableUnits: 0 }
					}
				}),
			)

			projects.value = enriched as Project[]
		} catch (err: unknown) {
			const errorObj = err as Error
			error.value = errorObj.message
		} finally {
			isLoading.value = false
		}
	}

	async function fetchProjectById(id: string) {
		isLoading.value = true
		error.value = null
		try {
			const response = await api.getProject(id)

			// Handle potential nesting (e.g., { project: { ... } })
			const rawData = response.data as unknown as Record<string, unknown>
			const projectData = (rawData.project || rawData) as unknown as Project

			// Initial data, units will be overwritten by RTDB if subscription is active
			const projectMap = projectData as unknown as Record<string, unknown>
			const unitsRaw = projectMap.units || projectMap.inventory || projectMap.lots || []

			const units = Array.isArray(unitsRaw) ? (unitsRaw as Unit[]) : []

			const finalProject = {
				...projectData,
				units: units,
			} as Project

			currentProject.value = finalProject

			// Subscribe for real-time updates
			subscribeToUnits(finalProject)
		} catch (err: unknown) {
			const errorObj = err as Error
			error.value = errorObj.message
		} finally {
			isLoading.value = false
		}
	}

	function subscribeToUnits(project: Project) {
		if (unsubscribe) unsubscribe()

		const typeProject = encodeURIComponent(project.typeProject || 'lotizer')
		const dbKey = encodeURIComponent(project.dbKey || project.id)
		const path = `v2/${typeProject}/${dbKey}/data/availability`

		const availabilityRef = dbRef(db, path)

		unsubscribe = onValue(
			availabilityRef,
			(snapshot) => {
				const data = snapshot.val()

				if (data && currentProject.value && currentProject.value.id === project.id) {
					const units = parseUnits(data)
					currentProject.value.units = units
					currentProject.value.totalUnits = units.length
					currentProject.value.availableUnits = units.filter((u) => u.status === 'available').length
				}
			},
			(err) => {
				console.error(`[projectStore] RTDB error for ${project.id}:`, err)
			},
		)
	}

	function unsubscribeFromUnits() {
		if (unsubscribe) {
			unsubscribe()
			unsubscribe = null
		}
	}

	async function updateUnitStatus(projectId: string, unitId: string, newStatus: Unit['status']) {
		// Local update for optimistic UI
		// Prioritize currentProject as it has the units loaded
		const project =
			(currentProject.value?.id === projectId ? currentProject.value : null) ||
			projects.value.find((p) => p.id === projectId)

		if (project) {
			if (!project.units) project.units = []
			const unit = project.units.find((u) => u.id === unitId)
			if (unit) {
				const oldStatus = unit.status
				unit.status = newStatus

				try {
					if (Array.isArray(unit)) {
						throw new Error('Internal Error: Unit is an array')
					}

					const payload = {
						id: unit.id,
						block: unit.block,
						lot: unit.lot,
						status: newStatus,
						price: unit.price,
						area: unit.area,
					}
					await api.updateAvailability(projectId, payload)
					// Update available units count
					project.availableUnits = project.units.filter((u) => u.status === 'available').length
				} catch (err: unknown) {
					// Rollback on error
					const errorObj = err as Error
					unit.status = oldStatus
					error.value = `Error actualizando estado: ${errorObj.message}`
				}
			}
		}
	}

	const searchQuery = ref('')

	const filteredProjects = computed(() => {
		const q = searchQuery.value.toLowerCase().trim()
		if (!q) return projects.value
		return projects.value.filter(
			(p) =>
				p.name.toLowerCase().includes(q) ||
				p.client?.toLowerCase().includes(q) ||
				p.description?.toLowerCase().includes(q),
		)
	})

	return {
		projects,
		filteredProjects,
		searchQuery,
		currentProject,
		isLoading,
		error,
		fetchProjects,
		fetchProjectById,
		updateUnitStatus,
		unsubscribeFromUnits,
	}
})
