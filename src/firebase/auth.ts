import { auth } from "./config";
import { onAuthStateChanged, type User } from "firebase/auth";
import { ref } from "vue";

export const currentUser = ref<User | null>(null);

onAuthStateChanged(auth, (user) => {
  currentUser.value = user;
});

export async function getAuthToken(): Promise<string | null> {
  let user = auth.currentUser;

  // If user is not immediately available, wait for auth to initialize
  if (!user) {
    user = await new Promise<User | null>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        unsubscribe();
        resolve(u);
      });
    });
  }

  if (!user) {
    console.warn("[Auth] No user found even after waiting for initialization.");
    return null;
  }

  return await user.getIdToken();
}

export async function logout(): Promise<void> {
  await auth.signOut();
}

export function isAuthenticated(): boolean {
  return !!auth.currentUser;
}
