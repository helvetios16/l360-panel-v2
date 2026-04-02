<script setup lang="ts">
import { computed, ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore, type Unit, type AvailabilityStatus } from '@/stores/projectStore'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()

const projectId = route.params.id as string
const project = computed(() => projectStore.currentProject)

const selectedUnit = ref<Unit | null>(null)
const isEditing = ref(false)
const isSaving = ref(false)

const editForm = reactive({
	block: '',
	lot: 0 as number,
	status: 'available' as AvailabilityStatus,
	price: undefined as number | undefined,
	m2: undefined as number | undefined,
	perimeter: undefined as number | undefined,
	front: undefined as number | undefined,
	left: undefined as number | undefined,
	right: undefined as number | undefined,
	back: undefined as number | undefined,
})

onMounted(() => {
	projectStore.fetchProjectById(projectId)
})

onUnmounted(() => {
	projectStore.unsubscribeFromUnits()
})

const getStatusColor = (status: Unit['status']) => {
	switch (status) {
		case 'available':
			return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
		case 'reserved':
			return 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30'
		case 'sold':
			return 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30'
		case 'blocked':
			return 'bg-slate-500/20 text-slate-400 border-slate-500/30 hover:bg-slate-500/30'
	}
}

function startEditing() {
	if (!selectedUnit.value) return
	const u = selectedUnit.value
	editForm.block = u.block
	editForm.lot = u.lot
	editForm.status = u.status
	editForm.price = u.price
	editForm.m2 = u.m2
	editForm.perimeter = u.perimeter
	editForm.front = u.front
	editForm.left = u.left
	editForm.right = u.right
	editForm.back = u.back
	isEditing.value = true
}

function cancelEditing() {
	isEditing.value = false
}

async function saveUnit() {
	if (!selectedUnit.value || !project.value) return
	isSaving.value = true
	try {
		await projectStore.updateUnit(project.value.id, {
			id: selectedUnit.value.id,
			block: editForm.block,
			lot: editForm.lot,
			status: editForm.status,
			price: editForm.price,
			m2: editForm.m2,
			perimeter: editForm.perimeter,
			front: editForm.front,
			left: editForm.left,
			right: editForm.right,
			back: editForm.back,
		})
		selectedUnit.value = {
			...selectedUnit.value,
			block: editForm.block,
			lot: editForm.lot,
			status: editForm.status,
			price: editForm.price,
			m2: editForm.m2,
			perimeter: editForm.perimeter,
			front: editForm.front,
			left: editForm.left,
			right: editForm.right,
			back: editForm.back,
		}
		isEditing.value = false
	} finally {
		isSaving.value = false
	}
}

const statusMap: Record<Unit['status'], string> = {
	available: 'Disponible',
	reserved: 'Reservado',
	sold: 'Vendido',
	blocked: 'Bloqueado',
}
</script>

<template>
	<div class="max-w-7xl mx-auto px-4 pb-20 mt-10">
		<div v-if="projectStore.isLoading" class="flex items-center justify-center py-20">
			<div
				class="animate-spin w-10 h-10 border-4 border-brand border-t-transparent rounded-full"
			></div>
		</div>

		<div
			v-else-if="projectStore.error"
			class="bg-red-400/10 border border-red-400/20 p-6 rounded-2xl text-red-400 text-center"
		>
			{{ projectStore.error }}
		</div>

		<div v-else-if="project" class="space-y-12">
			<header class="flex items-center space-x-6">
				<button
					@click="router.push('/')"
					class="p-3 bg-white/[0.02] hover:bg-white/5 border border-white/5 rounded-2xl transition-all duration-300 group"
				>
					<svg
						class="w-5 h-5 transition-transform group-hover:-translate-x-1"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 19l-7-7m0 0l7-7m-7 7h18"
						/>
					</svg>
				</button>
				<div>
					<h2 class="text-4xl font-bold text-white mb-2 tracking-tight">{{ project.name }}</h2>
					<p class="text-slate-500 font-medium tracking-wide uppercase text-[11px]">
						{{ project.client || 'General' }}
					</p>
				</div>
			</header>

			<div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
				<!-- Unit Grid -->
				<div class="lg:col-span-2 space-y-8">
					<div class="glass-card">
						<div
							class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10"
						>
							<h3 class="text-2xl font-bold">Mapa de Unidades</h3>
							<div class="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-wider">
								<div
									class="flex items-center px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-500"
								>
									<span
										class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
									></span>
									Disponible
								</div>
								<div
									class="flex items-center px-3 py-1.5 rounded-full bg-amber-500/5 border border-amber-500/10 text-amber-500"
								>
									<span
										class="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
									></span>
									Reservado
								</div>
								<div
									class="flex items-center px-3 py-1.5 rounded-full bg-rose-500/5 border border-rose-500/10 text-rose-500"
								>
									<span
										class="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
									></span>
									Vendido
								</div>
								<div
									class="flex items-center px-3 py-1.5 rounded-full bg-slate-500/5 border border-slate-500/10 text-slate-500"
								>
									<span
										class="w-1.5 h-1.5 rounded-full bg-slate-500 mr-2 shadow-[0_0_8px_rgba(100,116,139,0.4)]"
									></span>
									Bloqueado
								</div>
							</div>
						</div>

						<div class="grid grid-cols-5 sm:grid-cols-10 gap-3">
							<button
								v-for="unit in project.units"
								:key="unit.id"
								@click="selectedUnit = unit"
								:class="[
									'aspect-square rounded-xl border transition-all duration-300 text-[11px] font-black flex items-center justify-center',
									getStatusColor(unit.status),
									selectedUnit?.id === unit.id
										? 'ring-2 ring-brand ring-offset-4 ring-offset-black border-transparent scale-110 z-10 shadow-2xl'
										: '',
								]"
							>
								{{ unit.block }}-{{ unit.lot }}
							</button>
						</div>
					</div>
				</div>

				<!-- Unit Details / Editor -->
				<div class="space-y-8">
					<div class="glass-card sticky top-8">
						<div class="flex items-center justify-between mb-8">
							<h3 class="text-2xl font-bold">Detalle de Unidad</h3>
							<button
								v-if="selectedUnit && !isEditing"
								@click="startEditing"
								class="p-2.5 bg-white/[0.02] hover:bg-white/5 border border-white/5 rounded-xl transition-all duration-300"
								title="Editar"
							>
								<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
								</svg>
							</button>
						</div>

						<!-- READ MODE -->
						<div v-if="selectedUnit && !isEditing" class="space-y-8">
							<div class="grid grid-cols-2 gap-4">
								<div class="p-6 bg-white/[0.02] rounded-[1.5rem] border border-white/5 space-y-1">
									<p class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
										Manzana
									</p>
									<p class="text-2xl font-bold text-white">{{ selectedUnit.block }}</p>
								</div>
								<div class="p-6 bg-white/[0.02] rounded-[1.5rem] border border-white/5 space-y-1">
									<p class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
										Lote
									</p>
									<p class="text-2xl font-bold text-white">{{ selectedUnit.lot }}</p>
								</div>
							</div>

							<div
								v-if="selectedUnit.m2 || selectedUnit.price || selectedUnit.perimeter || selectedUnit.front || selectedUnit.left || selectedUnit.right || selectedUnit.back"
								class="space-y-4"
							>
								<p class="text-xs font-bold text-slate-400 uppercase tracking-widest">
									Medidas
								</p>
								<div class="grid grid-cols-2 gap-3">
									<div
										v-if="selectedUnit.m2"
										class="p-4 bg-white/[0.02] rounded-xl border border-white/5 flex justify-between items-center"
									>
										<span class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Área</span>
										<span class="text-sm font-bold text-white">{{ selectedUnit.m2 }} m²</span>
									</div>
									<div
										v-if="selectedUnit.price"
										class="p-4 bg-white/[0.02] rounded-xl border border-white/5 flex justify-between items-center"
									>
										<span class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Precio</span>
										<span class="text-sm font-bold text-white">${{ selectedUnit.price.toLocaleString() }}</span>
									</div>
									<div
										v-if="selectedUnit.perimeter"
										class="col-span-2 p-4 bg-white/[0.02] rounded-xl border border-white/5 flex justify-between items-center"
									>
										<span class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Perímetro</span>
										<span class="text-sm font-bold text-white">{{ selectedUnit.perimeter }} m</span>
									</div>
									<div
										v-if="selectedUnit.front"
										class="p-4 bg-white/[0.02] rounded-xl border border-white/5 flex justify-between items-center"
									>
										<span class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Frente</span>
										<span class="text-sm font-bold text-white">{{ selectedUnit.front }} m</span>
									</div>
									<div
										v-if="selectedUnit.back"
										class="p-4 bg-white/[0.02] rounded-xl border border-white/5 flex justify-between items-center"
									>
										<span class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Fondo</span>
										<span class="text-sm font-bold text-white">{{ selectedUnit.back }} m</span>
									</div>
									<div
										v-if="selectedUnit.left"
										class="p-4 bg-white/[0.02] rounded-xl border border-white/5 flex justify-between items-center"
									>
										<span class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Izq.</span>
										<span class="text-sm font-bold text-white">{{ selectedUnit.left }} m</span>
									</div>
									<div
										v-if="selectedUnit.right"
										class="p-4 bg-white/[0.02] rounded-xl border border-white/5 flex justify-between items-center"
									>
										<span class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Der.</span>
										<span class="text-sm font-bold text-white">{{ selectedUnit.right }} m</span>
									</div>
								</div>
							</div>

							<div class="space-y-4">
								<p class="text-xs font-bold text-slate-400 uppercase tracking-widest">
									Disponibilidad
								</p>
								<div class="grid grid-cols-2 gap-3">
									<div
										v-for="(label, status) in statusMap"
										:key="status"
										:class="[
											'py-3 px-4 rounded-xl border text-sm font-bold text-center',
											selectedUnit.status === status
												? status === 'available'
													? 'bg-emerald-500 text-white border-emerald-500 shadow-xl shadow-emerald-500/20'
													: status === 'reserved'
														? 'bg-amber-500 text-white border-amber-500 shadow-xl shadow-amber-500/20'
														: status === 'sold'
															? 'bg-rose-500 text-white border-rose-500 shadow-xl shadow-rose-500/20'
															: 'bg-slate-500 text-white border-slate-500 shadow-xl shadow-slate-500/20'
												: 'bg-white/5 border-white/5 text-slate-600',
										]"
									>
										{{ label }}
									</div>
								</div>
							</div>
						</div>

						<!-- EDIT MODE -->
						<div v-else-if="selectedUnit && isEditing" class="space-y-6">
							<div class="grid grid-cols-2 gap-4">
								<div class="space-y-2">
									<label class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Manzana</label>
									<input
										v-model="editForm.block"
										type="text"
										class="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-brand/50 transition-colors"
									/>
								</div>
								<div class="space-y-2">
									<label class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Lote</label>
									<input
										v-model.number="editForm.lot"
										type="number"
										min="1"
										class="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-brand/50 transition-colors"
									/>
								</div>
							</div>

							<div class="space-y-4">
								<p class="text-xs font-bold text-slate-400 uppercase tracking-widest">
									Medidas
								</p>
								<div class="grid grid-cols-2 gap-3">
									<div class="space-y-1">
										<label class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Área (m²)</label>
										<input
											v-model.number="editForm.m2"
											type="number"
											min="0"
											step="0.01"
											placeholder="---"
											class="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand/50 transition-colors"
										/>
									</div>
									<div class="space-y-1">
										<label class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Precio</label>
										<input
											v-model.number="editForm.price"
											type="number"
											min="0"
											step="0.01"
											placeholder="---"
											class="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand/50 transition-colors"
										/>
									</div>
									<div class="col-span-2 space-y-1">
										<label class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Perímetro (m)</label>
										<input
											v-model.number="editForm.perimeter"
											type="number"
											min="0"
											step="0.01"
											placeholder="---"
											class="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand/50 transition-colors"
										/>
									</div>
									<div class="space-y-1">
										<label class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Frente (m)</label>
										<input
											v-model.number="editForm.front"
											type="number"
											min="0"
											step="0.01"
											placeholder="---"
											class="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand/50 transition-colors"
										/>
									</div>
									<div class="space-y-1">
										<label class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Fondo (m)</label>
										<input
											v-model.number="editForm.back"
											type="number"
											min="0"
											step="0.01"
											placeholder="---"
											class="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand/50 transition-colors"
										/>
									</div>
									<div class="space-y-1">
										<label class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Izq. (m)</label>
										<input
											v-model.number="editForm.left"
											type="number"
											min="0"
											step="0.01"
											placeholder="---"
											class="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand/50 transition-colors"
										/>
									</div>
									<div class="space-y-1">
										<label class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Der. (m)</label>
										<input
											v-model.number="editForm.right"
											type="number"
											min="0"
											step="0.01"
											placeholder="---"
											class="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand/50 transition-colors"
										/>
									</div>
								</div>
							</div>

							<div class="space-y-4">
								<p class="text-xs font-bold text-slate-400 uppercase tracking-widest">
									Disponibilidad
								</p>
								<div class="grid grid-cols-2 gap-3">
									<button
										v-for="(label, status) in statusMap"
										:key="status"
										@click="editForm.status = status"
										:class="[
											'py-3 px-4 rounded-xl border text-sm font-bold transition-all duration-300',
											editForm.status === status
												? status === 'available'
													? 'bg-emerald-500 text-white border-emerald-500 shadow-xl shadow-emerald-500/20'
													: status === 'reserved'
														? 'bg-amber-500 text-white border-amber-500 shadow-xl shadow-amber-500/20'
														: status === 'sold'
															? 'bg-rose-500 text-white border-rose-500 shadow-xl shadow-rose-500/20'
															: 'bg-slate-500 text-white border-slate-500 shadow-xl shadow-slate-500/20'
												: 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-400',
										]"
									>
										{{ label }}
									</button>
								</div>
							</div>

							<div class="grid grid-cols-2 gap-3 pt-2">
								<button
									@click="cancelEditing"
									class="py-3 px-4 rounded-xl border border-white/10 text-sm font-bold text-slate-400 hover:bg-white/5 transition-all duration-300"
								>
									Cancelar
								</button>
								<button
									@click="saveUnit"
									:disabled="isSaving || !editForm.block || !editForm.lot"
									class="py-3 px-4 rounded-xl border border-brand bg-brand text-white text-sm font-bold hover:bg-brand/80 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
								>
									{{ isSaving ? 'Guardando...' : 'Guardar' }}
								</button>
							</div>
						</div>

						<div
							v-else
							class="flex flex-col items-center justify-center py-24 text-center space-y-8"
						>
							<div
								class="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center"
							>
								<svg
									class="w-10 h-10 text-slate-800"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="1.5"
										d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
									/>
								</svg>
							</div>
							<p class="text-slate-500 text-sm max-w-[200px] leading-relaxed">
								Selecciona una unidad en el mapa para ver sus detalles y gestionar su estado.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
