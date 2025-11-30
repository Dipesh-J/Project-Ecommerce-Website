import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, cartAPI } from '../services/api';

// Auth Store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      userId: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          if (response.status) {
            const { userId, token } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            set({
              token,
              userId,
              isAuthenticated: true,
              isLoading: false,
            });
            // Fetch user profile
            await get().fetchProfile();
            return { success: true };
          }
          throw new Error(response.message);
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Login failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      // Register action
      register: async (formData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(formData);
          if (response.status) {
            set({ isLoading: false });
            return { success: true, data: response.data };
          }
          throw new Error(response.message);
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Registration failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      // Fetch user profile
      fetchProfile: async () => {
        const userId = get().userId || localStorage.getItem('userId');
        if (!userId) return;

        set({ isLoading: true });
        try {
          const response = await authAPI.getProfile(userId);
          if (response.status) {
            set({ user: response.data, isLoading: false });
          }
        } catch {
          set({ isLoading: false });
        }
      },

      // Update profile
      updateProfile: async (formData) => {
        const userId = get().userId || localStorage.getItem('userId');
        if (!userId) return { success: false, error: 'Not authenticated' };

        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.updateProfile(userId, formData);
          if (response.status) {
            set({ user: response.data, isLoading: false });
            return { success: true, data: response.data };
          }
          throw new Error(response.message);
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Update failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      // Logout action
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        set({
          user: null,
          token: null,
          userId: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        userId: state.userId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Cart Store
export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: null,
      cartId: null,
      items: [],
      totalPrice: 0,
      totalItems: 0,
      isLoading: false,
      error: null,

      // Fetch cart
      fetchCart: async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        set({ isLoading: true, error: null });
        try {
          const response = await cartAPI.get(userId);
          if (response.status) {
            const cart = response.data;
            set({
              cart,
              cartId: cart._id,
              items: cart.items || [],
              totalPrice: cart.totalPrice || 0,
              totalItems: cart.totalItems || 0,
              isLoading: false,
            });
          }
        } catch (error) {
          if (error.response?.status === 404) {
            // Cart doesn't exist yet
            set({
              cart: null,
              cartId: null,
              items: [],
              totalPrice: 0,
              totalItems: 0,
              isLoading: false,
            });
          } else {
            set({ error: error.response?.data?.message || 'Failed to fetch cart', isLoading: false });
          }
        }
      },

      // Add item to cart
      addItem: async (productId, quantity = 1) => {
        const userId = localStorage.getItem('userId');
        if (!userId) return { success: false, error: 'Please login to add items to cart' };

        set({ isLoading: true, error: null });
        try {
          const data = { productId, quantity };
          const cartId = get().cartId;
          if (cartId) {
            data.cartId = cartId;
          }

          const response = await cartAPI.addItem(userId, data);
          if (response.status) {
            const cart = response.data;
            set({
              cart,
              cartId: cart._id,
              items: cart.items || [],
              totalPrice: cart.totalPrice || 0,
              totalItems: cart.totalItems || 0,
              isLoading: false,
            });
            return { success: true };
          }
          throw new Error(response.message);
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Failed to add item';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      // Update item quantity (decrease by 1 or remove)
      updateItem: async (productId, removeProduct) => {
        const userId = localStorage.getItem('userId');
        const cartId = get().cartId;
        if (!userId || !cartId) return { success: false, error: 'Cart not found' };

        set({ isLoading: true, error: null });
        try {
          const response = await cartAPI.updateItem(userId, { cartId, productId, removeProduct });
          if (response.status) {
            const cart = response.data;
            set({
              cart,
              items: cart.items || [],
              totalPrice: cart.totalPrice || 0,
              totalItems: cart.totalItems || 0,
              isLoading: false,
            });
            return { success: true };
          }
          throw new Error(response.message);
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Failed to update cart';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      // Remove item from cart
      removeItem: async (productId) => {
        return get().updateItem(productId, 0);
      },

      // Decrease quantity by 1
      decreaseQuantity: async (productId) => {
        return get().updateItem(productId, 1);
      },

      // Clear cart
      clearCart: async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        set({ isLoading: true, error: null });
        try {
          await cartAPI.clear(userId);
          set({
            cart: null,
            items: [],
            totalPrice: 0,
            totalItems: 0,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to clear cart', isLoading: false });
          return { success: false };
        }
      },

      // Reset cart on logout
      resetCart: () => {
        set({
          cart: null,
          cartId: null,
          items: [],
          totalPrice: 0,
          totalItems: 0,
          error: null,
        });
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        cartId: state.cartId,
      }),
    }
  )
);
