<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore, type Unit } from '@/stores/projectStore'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()

const projectId = route.params.id as string
const project = computed(() => projectStore.currentProject)

const selectedUnit = ref<Unit | null>(null)

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

const changeStatus = (newStatus: Unit['status']) => {
	if (selectedUnit.value && project.value) {
		projectStore.updateUnitStatus(project.value.id, selectedUnit.value.id, newStatus)
		selectedUnit.value = { ...selectedUnit.value, status: newStatus }
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
								{{ unit.lot }}
							</button>
						</div>
					</div>
				</div>

				<!-- Unit Details / Editor -->
				<div class="space-y-8">
					<div class="glass-card sticky top-8">
						<h3 class="text-2xl font-bold mb-8">Detalle de Unidad</h3>

						<div v-if="selectedUnit" class="space-y-8">
							<div class="p-6 bg-white/[0.02] rounded-[1.5rem] border border-white/5 space-y-1">
								<p class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
									Ubicación
								</p>
								<p class="text-3xl font-bold text-white">
									MZ {{ selectedUnit.block }} - LT {{ selectedUnit.lot }}
								</p>
							</div>

							<div class="grid grid-cols-2 gap-4">
								<div class="p-6 bg-white/[0.02] rounded-[1.5rem] border border-white/5 space-y-1">
									<p class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
										Área
									</p>
									<p class="text-2xl font-bold text-white">{{ selectedUnit.area || '---' }} m²</p>
								</div>
								<div class="p-6 bg-white/[0.02] rounded-[1.5rem] border border-white/5 space-y-1">
									<p class="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
										Precio
									</p>
									<p class="text-2xl font-bold text-white">
										{{ selectedUnit.price ? `$${selectedUnit.price.toLocaleString()}` : '---' }}
									</p>
								</div>
							</div>

							<div class="space-y-4">
								<p class="text-xs font-bold text-slate-400 uppercase tracking-widest">
									Cambiar Disponibilidad
								</p>
								<div class="flex flex-col space-y-3">
									<button
										v-for="(label, status) in statusMap"
										:key="status"
										@click="changeStatus(status)"
										:class="[
											'w-full py-4 px-6 rounded-2xl border font-bold transition-all duration-300',
											selectedUnit.status === status
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
