import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      isOpen: false,
      user: null,

      // Drawer Open/Close
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      // Add to Cart
      addToCart: (product, qtyArg) => {
        const currentCart = get().cart;
        // Normalize ID (_id ya id dono support hon)
        const targetId = product._id || product.id;

        const existingIndex = currentCart.findIndex(
          (item) => (item._id || item.id) === targetId
        );

        // Determine added quantity
        let addQty = 1;
        if (typeof qtyArg === 'number' && !isNaN(qtyArg)) {
          addQty = qtyArg;
        } else if (typeof product?.quantity === 'number' && !isNaN(product.quantity)) {
          addQty = product.quantity;
        }
        addQty = Math.max(1, Math.floor(addQty));

        if (existingIndex > -1) {
          const updatedCart = currentCart.map((item, index) => {
            if (index === existingIndex) {
              return {
                ...item,
                quantity: (item.quantity || 1) + addQty,
              };
            }
            return item;
          });
          set({ cart: updatedCart });
        } else {
          set({
            cart: [
              ...currentCart,
              {
                ...product,
                id: targetId, // Backend Order schema ke mutabiq id normalize
                quantity: addQty,
              },
            ],
          });
        }

        // Trigger dynamic toast notification
        const itemText = addQty === 1 ? '1 item' : `${addQty} items`;
        get().showToast(`Added ${itemText} to cart successfully`);
      },

      // Remove from Cart
      removeFromCart: (productId) => {
        set({
          cart: get().cart.filter(
            (item) => (item._id || item.id) !== productId
          ),
        });
      },

      // Update Quantity
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set({
          cart: get().cart.map((item) =>
            (item._id || item.id) === productId
              ? { ...item, quantity }
              : item
          ),
        });
      },

      // Clear Cart
      clearCart: () => set({ cart: [] }),

      // User State
      setUser: (userOrFn) =>
        set((state) => ({
          user: typeof userOrFn === 'function' ? userOrFn(state.user) : userOrFn,
        })),
      addOrderToUser: (newOrder) => {
        const currentUser = get().user;
        if (!currentUser || !newOrder) return;
        const currentOrders = Array.isArray(currentUser.orders) ? currentUser.orders : [];
        const orderId = newOrder._id || newOrder.id;
        set({
          user: {
            ...currentUser,
            orders: [newOrder, ...currentOrders.filter((o) => (o._id || o.id) !== orderId)],
          },
        });
      },
      addAddressToUser: (newAddress) => {
        const currentUser = get().user;
        if (!currentUser || !newAddress) return null;
        const currentAddresses = Array.isArray(currentUser.addresses) ? [...currentUser.addresses] : [];

        const street = (newAddress.streetAddress || newAddress.address || '').trim();
        const city = (newAddress.city || '').trim();
        if (!street || !city) return currentAddresses;

        const normStreet = street.toLowerCase();
        const normCity = city.toLowerCase();

        const existingIndex = currentAddresses.findIndex((a) => {
          const aStreet = (a.streetAddress || a.address || '').trim().toLowerCase();
          const aCity = (a.city || '').trim().toLowerCase();
          return aStreet === normStreet && aCity === normCity;
        });

        const isFirst = currentAddresses.length === 0;

        const formattedAddress = {
          fullName: (newAddress.fullName || newAddress.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`).trim() || 'Valued Customer',
          phone: (newAddress.phone || currentUser.phone || '').trim(),
          streetAddress: street,
          city: city,
          state: (newAddress.state || '').trim(),
          postalCode: (newAddress.postalCode || '').trim(),
          country: (newAddress.country || 'Pakistan').trim(),
          isDefault: isFirst || !!newAddress.isDefault,
        };

        let updatedAddresses;
        if (existingIndex > -1) {
          updatedAddresses = currentAddresses.map((a, idx) =>
            idx === existingIndex
              ? { ...a, ...formattedAddress, isDefault: a.isDefault }
              : a
          );
        } else {
          updatedAddresses = [...currentAddresses, formattedAddress];
        }

        set({
          user: {
            ...currentUser,
            addresses: updatedAddresses,
          },
        });

        return updatedAddresses;
      },

      // Toast Message State
      toastMessage: null,
      _toastTimer: null,
      showToast: (msg) => {
        const prevTimer = get()._toastTimer;
        if (prevTimer) {
          clearTimeout(prevTimer);
        }
        const timer = setTimeout(() => {
          set({ toastMessage: null, _toastTimer: null });
        }, 3500);
        set({ toastMessage: msg, _toastTimer: timer });
      },
    }),
    {
      name: 'aura-cart-storage',
      storage: createJSONStorage(() => localStorage),
      // Sirf cart aur user ko localStorage mein save karega, isOpen ko nahi
      partialize: (state) => ({ cart: state.cart, user: state.user }),
    }
  )
);