<script setup lang="ts">
import { onMounted } from "vue";
import { useProjectStore, type Project } from "@/stores/projectStore";
import { useRouter } from "vue-router";

const projectStore = useProjectStore();
const router = useRouter();

onMounted(() => {
	projectStore.fetchProjects();
});

const navigateToProject = (id: string) => {
	router.push(`/project/${id}`);
};

const getTotal = (p: Project) => p.totalUnits || p.units?.length || 0;
const getAvailable = (p: Project) => p.availableUnits || p.units?.filter(u => u.status === "available").length || 0;
const getSold = (p: Project) => {
	const total = getTotal(p);
	if (!total) return 0;
	return Math.round((1 - getAvailable(p) / total) * 100);
};
</script>

<template>
	<div class="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8">
		<!-- Loading -->
		<div v-if="projectStore.isLoading" class="flex items-center justify-center py-32">
			<div class="animate-spin w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full"></div>
		</div>

		<!-- Error -->
		<div v-else-if="projectStore.error" class="bg-red-500/[0.08] border border-red-500/15 px-5 py-4 rounded-xl text-red-400 text-sm text-center">
			{{ projectStore.error }}
		</div>

		<template v-else>
			<!-- Header -->
			<div class="flex items-end justify-between">
				<div>
					<h2 class="text-2xl font-bold text-white tracking-tight">Proyectos</h2>
					<p class="text-sm text-slate-500 mt-1">{{ projectStore.filteredProjects.length }} proyecto{{ projectStore.filteredProjects.length !== 1 ? 's' : '' }}</p>
				</div>
			</div>

			<!-- Empty search -->
			<div v-if="projectStore.searchQuery && projectStore.filteredProjects.length === 0" class="text-center py-20">
				<svg class="w-12 h-12 mx-auto text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1">
					<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
				</svg>
				<p class="text-slate-500 text-sm">No se encontraron proyectos para "<span class="text-slate-300">{{ projectStore.searchQuery }}</span>"</p>
			</div>

			<!-- Grid -->
			<div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<div
					v-for="project in projectStore.filteredProjects"
					:key="project.id"
					@click="navigateToProject(project.id)"
					class="group cursor-pointer bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300"
				>
					<!-- Image -->
					<div class="h-44 overflow-hidden relative">
						<img
							:src="project.image"
							:alt="project.name"
							class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
						/>
						<div class="absolute inset-0 bg-linear-to-t from-[#060809] via-transparent to-transparent"></div>
					</div>

					<!-- Content -->
					<div class="p-5 space-y-4">
						<!-- Title + Client -->
						<div>
							<h3 class="text-base font-semibold text-white group-hover:text-brand-light transition-colors duration-200 truncate">
								{{ project.name }}
							</h3>
							<p class="text-xs text-slate-500 mt-0.5">{{ project.client || 'General' }}</p>
						</div>

						<!-- Stats -->
						<div class="flex gap-3">
							<div class="flex-1 bg-white/[0.03] rounded-lg px-3 py-2.5">
								<p class="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Total</p>
								<p class="text-lg font-bold text-white">{{ getTotal(project) }}</p>
							</div>
							<div class="flex-1 bg-brand/[0.06] rounded-lg px-3 py-2.5">
								<p class="text-[10px] uppercase tracking-wider text-brand-light/70 mb-0.5">Disponibles</p>
								<p class="text-lg font-bold text-brand-light">{{ getAvailable(project) }}</p>
							</div>
						</div>

						<!-- Progress -->
						<div class="space-y-2">
							<div class="w-full bg-white/[0.06] h-1 rounded-full overflow-hidden">
								<div
									class="h-full bg-linear-to-r from-brand to-brand-dark rounded-full transition-all duration-700"
									:style="{ width: `${getSold(project)}%` }"
								></div>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-[11px] text-slate-600">Vendido</span>
								<span class="text-xs font-semibold text-slate-300">
									{{ getSold(project) }}%
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>
