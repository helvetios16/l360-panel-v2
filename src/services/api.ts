import { getAuthToken } from '@/firebase/auth'
import type { Project } from '@/stores/projectStore'

const BASE_URL =
	import.meta.env.VITE_API_BASE_URL || 'https://us-central1-lienzo360.cloudfunctions.net/api'

interface ApiResponse<T> {
	success: boolean
	data: T
	message: string
}

async function apiFetch<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
	const token = await getAuthToken()
	if (!token) {
		// Silent fail or handle as needed, the warning was for debugging
	}

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		...(options.headers as Record<string, string>),
	}

	const response = await fetch(`${BASE_URL}${endpoint}`, {
		...options,
		headers,
	})

	const result = await response.json()

	if (!response.ok) {
		console.error(`[API] Error from ${endpoint}:`, result.message, result.errors || '')
		throw new Error(result.message || 'Something went wrong')
	}

	return result
}

export const api = {
	getProjects: () => apiFetch<ApiResponse<{ projects: Project[] }>>('/projects'),
	getProject: (id: string) => apiFetch<ApiResponse<Project>>(`/projects/${encodeURIComponent(id)}`),
	updateProject: (id: string, data: Record<string, unknown>) =>
		apiFetch<ApiResponse<unknown>>(`/projects/${encodeURIComponent(id)}`, {
			method: 'PUT',
			body: JSON.stringify(data),
		}),
	updateAvailability: (
		id: string,
		unit: { id: string; block: string; lot: string; status: string; [key: string]: unknown },
	) =>
		apiFetch<ApiResponse<unknown>>(`/projects/${encodeURIComponent(id)}/availability`, {
			method: 'POST',
			body: JSON.stringify(unit),
		}),
}
