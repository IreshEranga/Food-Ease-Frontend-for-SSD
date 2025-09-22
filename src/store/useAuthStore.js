import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      deliveryLocation: null,
      deliveryLatLng: null,

      // Set authentication state
      setAuth: ({ isAuthenticated, user, token }) =>
        set(() => ({
          isAuthenticated,
          user,
          token,
        })),

      // Set delivery location and lat/lng
      setDeliveryLocation: (location, latlng) =>
        set(() => ({
          deliveryLocation: location,
          deliveryLatLng: latlng,
        })),

      // Clear auth & location info
      logout: () =>
        set(() => ({
          isAuthenticated: false,
          user: null,
          token: null,
          deliveryLocation: null,
          deliveryLatLng: null,
        })),
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);
