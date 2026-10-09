import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { X, Trash2, ShoppingBag } from 'lucide-react';

export default function CartDrawer() {
  const navigate = useNavigate();

  const cart = useCartStore((state) => state.cart) || [];
  const isOpen = useCartStore((state) => state.isOpen);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

  const handleProceedToCheckout = () => {
    toggleCart();
    navigate('/checkout');
  };

  return (
    <div 
      className="fixed inset-0 z-999 w-full select-none overflow-hidden"
      style={{
        height: '100dvh',
        maxHeight: '100dvh',
      }}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={toggleCart}
      />

      {/* Sliding Drawer Container: Exactly 100dvh, pinned to top and bottom */}
      <div 
        className="fixed top-0 bottom-0 right-0 w-full sm:max-w-md flex flex-col bg-[#F9F9F8] shadow-2xl border-l border-neutral-200 z-10 overflow-hidden"
        style={{
          height: '100dvh',
          maxHeight: '100dvh',
        }}
      >
        
        {/* Header */}
        <div 
          className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-neutral-200 bg-white shrink-0"
          style={{
            paddingTop: 'max(0.875rem, calc(0.5rem + env(safe-area-inset-top, 0px)))',
          }}
        >
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4 text-neutral-900" />
            <h2 className="text-xs uppercase tracking-widest font-bold text-neutral-900">
              Your Bag ({totalItems})
            </h2>
          </div>
          <button 
            type="button" 
            onClick={toggleCart}
            className="text-neutral-500 hover:text-neutral-900 p-1 cursor-pointer transition-colors"
            aria-label="Close Cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Items List */}
        <div 
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 sm:px-5 py-3 space-y-2.5"
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {cart.length === 0 ? (
            <div className="text-center py-20 text-neutral-500 text-xs uppercase tracking-widest">
              Your shopping bag is empty.
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={item.id || index} className="flex space-x-3 bg-white p-2.5 sm:p-3 rounded-xs border border-neutral-200 shadow-2xs">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-14 h-16 sm:w-16 sm:h-20 object-cover object-center rounded-xs bg-neutral-100 shrink-0" 
                />
                
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <h3 className="text-xs font-medium text-neutral-900 line-clamp-1">{item.name}</h3>
                      <span className="text-xs font-bold text-neutral-900 shrink-0">
                        ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[9px] text-neutral-500 uppercase tracking-wider">{item.category}</p>
                    {(item.selectedSize || item.selectedColor) && (
                      <p className="text-[9px] text-neutral-400 uppercase tracking-wide">
                        {item.selectedSize} {item.selectedColor ? `/ ${item.selectedColor}` : ''}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-neutral-100">
                    <div className="flex items-center border border-neutral-300 rounded-xs bg-neutral-50 scale-95 origin-left">
                      <button 
                        type="button" 
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                        className="px-2 py-0.5 text-[11px] font-bold text-neutral-700 hover:bg-neutral-200 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-semibold text-neutral-900">{item.quantity || 1}</span>
                      <button 
                        type="button" 
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                        className="px-2 py-0.5 text-[11px] font-bold text-neutral-700 hover:bg-neutral-200 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => removeFromCart(item.id)}
                      className="text-neutral-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Guaranteed inside viewport on all iPhone models */}
        {cart.length > 0 && (
          <div 
            className="border-t border-neutral-200 px-4 sm:px-6 pt-3 bg-white space-y-2.5 shrink-0 shadow-lg"
            style={{
              paddingBottom: 'max(0.85rem, calc(0.5rem + env(safe-area-inset-bottom, 0px)))',
            }}
          >
            <div className="flex justify-between items-center text-xs uppercase tracking-widest font-semibold text-neutral-900">
              <span>Subtotal</span>
              <span className="font-bold text-sm sm:text-base font-mono">${subtotal.toFixed(2)}</span>
            </div>
            
            <p className="text-[10px] text-neutral-400 tracking-wider">
              Taxes and shipping calculated at checkout.
            </p>

            <button 
              type="button" 
              onClick={handleProceedToCheckout}
              className="w-full bg-neutral-900 text-white py-3 sm:py-3.5 px-6 min-h-11 text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 active:bg-neutral-950 transition-colors cursor-pointer rounded-xs flex items-center justify-center text-center shadow-md active:scale-[0.99]"
            >
              Proceed to Checkout
            </button>
          </div>
        )}

      </div>
    </div>
  );
}