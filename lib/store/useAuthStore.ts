import { create } from "zustand";

const AUTH_STORAGE_KEY = "auth-storage";

type User = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

type AuthStore = {
  user: User | null;
  loading: boolean;

  setUser: (user: User | null) => void;
  setLoading: (value: boolean) => void;
  clearUser: () => void;
};

function removeLegacyAuthStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

// Drop stale persisted user from an older build on first load.
removeLegacyAuthStorage();

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  clearUser: () => {
    removeLegacyAuthStorage();
    set({ user: null, loading: false });
  },
}));
