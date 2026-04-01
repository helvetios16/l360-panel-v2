<script setup lang="ts">
import { ref } from "vue";
import { auth } from "@/firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const errorMsg = ref("");
const isLoading = ref(false);
const router = useRouter();

async function handleLogin() {
  isLoading.value = true;
  errorMsg.value = "";
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    router.push({ name: "dashboard" });
  } catch (err: unknown) {
    const error = err as Error;
    errorMsg.value = "Credenciales inválidas o error de conexión";
    console.error(error.message);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#0a0c10] px-4">
    <div class="glass-card max-w-md w-full p-10 space-y-8">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold text-white tracking-tight">Bienvenido</h1>
        <p class="text-slate-500 text-sm">Ingresa a tu panel de control</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-widest text-slate-400 ml-1">Email</label>
          <input 
            v-model="email" 
            type="email" 
            required
            class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand/50 transition-colors"
            placeholder="admin@ejemplo.com"
          />
        </div>

        <div class="space-y-2">
          <label class="text-xs font-semibold uppercase tracking-widest text-slate-400 ml-1">Contraseña</label>
          <input 
            v-model="password" 
            type="password" 
            required
            class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand/50 transition-colors"
            placeholder="••••••••"
          />
        </div>

        <div v-if="errorMsg" class="text-red-400 text-xs text-center font-medium bg-red-400/10 py-3 rounded-xl border border-red-400/20">
          {{ errorMsg }}
        </div>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full bg-linear-to-r from-brand to-brand-dark hover:from-brand-light hover:to-brand text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-brand/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!isLoading">Iniciar Sesión</span>
          <span v-else class="flex items-center justify-center">
            <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
        </button>
      </form>
    </div>
  </div>
</template>
