<script setup lang="ts">
import { ref, computed, watchEffect } from "vue";
import { RouterLink, RouterView, useRouter } from "vue-router";
import { logout, currentUser } from "@/firebase/auth";
import { useProjectStore } from "@/stores/projectStore";

const isSidebarOpen = ref(false);
const router = useRouter();
const projectStore = useProjectStore();
const userRole = ref("Usuario");

const userName = computed(() => {
	return currentUser.value?.displayName || currentUser.value?.email?.split("@")[0] || "Usuario";
});

const userInitial = computed(() => {
	return userName.value.charAt(0).toUpperCase();
});

watchEffect(async () => {
	if (currentUser.value) {
		try {
			const tokenResult = await currentUser.value.getIdTokenResult();
			userRole.value = (tokenResult.claims.role as string) || "Usuario";
		} catch {
			userRole.value = "Usuario";
		}
	}
});

const handleLogout = async () => {
	try {
		await logout();
		router.push({ name: "login" });
	} catch (error) {
		console.error("Error logging out:", error);
	}
};

const navItems = [
	{
		name: "Dashboard",
		icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1",
		path: "/",
	},
];
</script>

<template>
	<div class="flex h-screen overflow-hidden bg-[#060809]">
		<!-- Mobile overlay -->
		<div
			v-if="isSidebarOpen"
			class="fixed inset-0 bg-black/60 z-40 lg:hidden"
			@click="isSidebarOpen = false"
		></div>

		<!-- Sidebar -->
		<aside
			:class="[
				'fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0c10] border-r border-white/[0.06] transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col',
				isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
			]"
		>
			<!-- Logo -->
			<div class="px-6 h-16 flex items-center border-b border-white/[0.06]">
				<h1 class="text-xl font-bold tracking-tight">
					<span class="bg-linear-to-r from-brand-light to-brand bg-clip-text text-transparent">L360</span>
				</h1>
				<span class="ml-2 text-[10px] uppercase tracking-widest text-slate-600 font-medium">Panel</span>
			</div>

			<!-- Nav -->
			<nav class="flex-1 px-3 py-4">
				<RouterLink
					v-for="item in navItems"
					:key="item.name"
					:to="item.path"
					class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 transition-all duration-200 hover:text-white hover:bg-white/[0.04]"
					active-class="!text-white !bg-white/[0.06]"
					@click="isSidebarOpen = false"
				>
					<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
					</svg>
					<span class="font-medium">{{ item.name }}</span>
				</RouterLink>
			</nav>

			<!-- User -->
			<div class="p-3 border-t border-white/[0.06] space-y-2">
				<div class="flex items-center gap-3 px-3 py-3 rounded-lg bg-white/[0.02]">
					<div class="w-8 h-8 rounded-full bg-brand/15 flex items-center justify-center text-brand text-xs font-bold shrink-0">
						{{ userInitial }}
					</div>
					<div class="min-w-0">
						<p class="text-sm font-medium text-white truncate">{{ userName }}</p>
						<p class="text-[11px] text-slate-500 truncate capitalize">{{ userRole }}</p>
					</div>
				</div>

				<button
					@click="handleLogout"
					class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-200"
				>
					<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
					</svg>
					<span class="font-medium">Cerrar Sesión</span>
				</button>
			</div>
		</aside>

		<!-- Main -->
		<div class="flex-1 flex flex-col min-w-0 overflow-hidden">
			<!-- Topbar -->
			<header class="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-white/[0.06] bg-[#060809]/80 backdrop-blur-xl shrink-0">
				<button
					@click="isSidebarOpen = !isSidebarOpen"
					class="lg:hidden p-2 -ml-2 hover:bg-white/[0.06] rounded-lg transition-colors"
				>
					<svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
					</svg>
				</button>

				<!-- Search -->
				<div class="flex-1 max-w-md ml-4 lg:ml-0">
					<div class="relative">
						<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
						</svg>
						<input
							v-model="projectStore.searchQuery"
							type="text"
							placeholder="Buscar proyectos..."
							class="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-brand/30 focus:bg-white/[0.06] transition-all duration-200"
						/>
					</div>
				</div>

				<div class="w-10 lg:hidden"></div>
			</header>

			<!-- Content -->
			<main class="flex-1 overflow-x-hidden overflow-y-auto">
				<RouterView />
			</main>
		</div>
	</div>
</template>
