import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState } from '@/types/pinboard';

interface AuthStore extends AuthState {
  login: (apiToken: string, username: string) => void;
  logout: () => void;
  setApiToken: (token: string) => void;
  setUsername: (username: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      apiToken: null,
      username: null,
      
      login: (apiToken: string, username: string) => 
        set({ 
          isAuthenticated: true, 
          apiToken, 
          username 
        }),
      
      logout: () => 
        set({ 
          isAuthenticated: false, 
          apiToken: null, 
          username: null 
        }),
      
      setApiToken: (apiToken: string) => 
        set({ apiToken }),
      
      setUsername: (username: string) => 
        set({ username }),
    }),
    {
      name: 'pinbook-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        apiToken: state.apiToken,
        username: state.username,
      }),
    }
  )
);
