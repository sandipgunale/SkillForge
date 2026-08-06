import { create } from "zustand";

/**
 * Tiny cross-tree signal so the 3D core on the auth pages can react
 * to form submission (progress ring accelerates, energy speeds up).
 */
export const useAuthSceneStore = create((set) => ({
  busy: false,
  setBusy: (busy) => set({ busy }),
}));
