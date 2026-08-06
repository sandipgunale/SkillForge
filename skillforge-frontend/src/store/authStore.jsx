import { create } from "zustand";

import { refreshAccessToken } from "@/services/api/interceptors";

const AUTH_STORAGE_KEY = "skillforge_auth";

/**
 * Only the non-sensitive identity is persisted to localStorage.
 * The access token lives in memory alone, so an XSS can't exfiltrate
 * a live token; sessions are restored silently via the httpOnly refresh
 * cookie on app boot.
 */
const getStoredUser = () => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!stored) return null;

  try {
    return JSON.parse(stored)?.user ?? null;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const useAuthStore = create((set, get) => {
  const storedUser = getStoredUser();

  return {
    session: storedUser ? { user: storedUser } : null,

    // True while we restore the session from the refresh cookie on boot.
    bootstrapping: !!storedUser,

    login: (session) => {
      persistUser(session.user);

      set({
        session,
        bootstrapping: false,
      });
    },

    setSession: (session) => {
      persistUser(session.user);

      set({
        session,
        bootstrapping: false,
      });
    },

    updateUser: (updatedUser) =>
      set((state) => {
        if (!state.session) return state;

        persistUser(updatedUser);

        return {
          session: {
            ...state.session,
            user: updatedUser,
          },
        };
      }),

    logout: () => {
      localStorage.removeItem(AUTH_STORAGE_KEY);

      set({
        session: null,
        bootstrapping: false,
      });
    },

    forceLogout: () => {
      localStorage.removeItem(AUTH_STORAGE_KEY);

      set({
        session: null,
        bootstrapping: false,
      });
    },

    bootstrap: async () => {
      if (!get().session?.user) return;

      try {
        await refreshAccessToken();
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        set({
          session: null,
          bootstrapping: false,
        });
      }
    },
  };
});

function persistUser(user) {
  if (!user) return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user }));
}

export const useAuth = () => {
  const session = useAuthStore((state) => state.session);
  const bootstrapping = useAuthStore((state) => state.bootstrapping);

  return {
    session,
    accessToken: session?.accessToken ?? null,
    tokenType: session?.tokenType ?? null,
    user: session?.user ?? null,
    role: session?.user?.role ?? null,
    isAuthenticated: !!session?.accessToken && !!session?.user,
    bootstrapping,
  };
};