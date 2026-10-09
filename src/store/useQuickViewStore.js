import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useQuickViewStore = create(
  persist(
    (set, get) => ({
      isOpen: false,
      product: null,
      wishlist: [],

      // Open / Close Drawer
      openQuickView: (product) => set({ isOpen: true, product }),
      closeQuickView: () => set({ isOpen: false }),

      // Wishlist toggle
      toggleWishlist: (productId) => {
        const current = get().wishlist;
        const exists = current.includes(productId);
        const updated = exists
          ? current.filter((id) => id !== productId)
          : [...current, productId];
        set({ wishlist: updated });
        return !exists;
      },
      isInWishlist: (productId) => get().wishlist.includes(productId),
    }),
    {
      name: 'aura-quickview-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ wishlist: state.wishlist }),
    }
  )
);
