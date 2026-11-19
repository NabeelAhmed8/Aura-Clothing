import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useQuickViewStore = create(
  persist(
    (set, get) => ({
      isOpen: false,
      product: null,
      wishlist: [],

      openQuickView: (product) => set({ isOpen: true, product }),
      closeQuickView: () => set({ isOpen: false }),

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
