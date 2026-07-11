import { create } from "zustand";

const AUTH_STORAGE_KEY = "skillforge_auth";

const getStoredSession = () => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const useAuthStore = create((set) => ({
  session: getStoredSession(),

  login: (authResponse) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authResponse));

    set({
      session: authResponse,
    });
  },

  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);

    set({
      session: null,
    });
  },

  updateUser: (updatedUser) =>
    set((state) => {
      if (!state.session) return state;

      const updatedSession = {
        ...state.session,
        user: updatedUser,
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedSession));

      return {
        session: updatedSession,
      };
    }),
}));

export const useAuth = () => {
  const session = useAuthStore((state) => state.session);

  return {
    session,
    accessToken: session?.accessToken ?? null,
    tokenType: session?.tokenType ?? null,
    expiresIn: session?.expiresIn ?? null,
    user: session?.user ?? null,
    role: session?.user?.role ?? null,
    isAuthenticated: !!session?.accessToken && !!session?.user,
  };
};
