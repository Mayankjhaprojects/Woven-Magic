import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Header from '../components/Header';
import { resolveImage } from '../utils/imageHelper';

export default function CartPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      loadGuestCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  const loadGuestCart = () => {
    const guestCart = JSON.parse(localStorage.getItem('pc_cart') || '[]');
    // guest stored items shape assumed { id, name, price, qty, img } — adapt if different
    setCart({ items: guestCart.map((item) => ({ ...item, product: item })) });
    setLoading(false);
  };

  const updateQty = async (itemId, quantity) => {
    const q = Math.max(1, quantity);
    if (user) {
      try {
        await api.put(`/cart/${itemId}`, { quantity: q });
        await fetchCart();
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    } else {
      const guestCart = JSON.parse(localStorage.getItem('pc_cart') || '[]');
      const updated = guestCart.map((item) =>
        item.id === itemId ? { ...item, qty: q } : item
      );
      localStorage.setItem('pc_cart', JSON.stringify(updated));
      setCart({ items: updated.map((item) => ({ ...item, product: item })) });
    }
  };

  const removeItem = async (itemId) => {
    if (user) {
      try {
        await api.delete(`/cart/${itemId}`);
        await fetchCart();
      } catch (error) {
        console.error('Error removing item:', error);
      }
    } else {
      const guestCart = JSON.parse(localStorage.getItem('pc_cart') || '[]');
      const updated = guestCart.filter((item) => item.id !== itemId);
      localStorage.setItem('pc_cart', JSON.stringify(updated));
      setCart({ items: updated.map((item) => ({ ...item, product: item })) });
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await api.delete('/cart');
        await fetchCart();
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    } else {
      localStorage.removeItem('pc_cart');
      setCart({ items: [] });
    }
  };

  const cartItemCount =
    (cart.items?.reduce((sum, item) => {
      if (user) return sum + (item.quantity || 0);
      return sum + (item.qty || 0);
    }, 0) || 0);

  const subtotal =
    (cart.items?.reduce((sum, item) => {
      if (user) {
        const price = item.product?.price || 0;
        const qty = item.quantity || 0;
        return sum + price * qty;
      }
      return sum + (item.price || 0) * (item.qty || 0);
    }, 0) || 0);

  const checkoutWhatsApp = () => {
    if (!cart.items?.length) {
      alert('Your cart is empty.');
      return;
    }
    const customerName = user?.name || 'Guest';
    const lines = cart.items.map((item) => {
      if (user) {
        return `${item.product?.name} x${item.quantity} — ₹${(item.product?.price || 0) * (item.quantity || 0)}`;
      }
      return `${item.name} x${item.qty} — ₹${item.price * item.qty}`;
    });
    const message = `Hello! My name is ${customerName}.\n\nI'd like to order:\n${lines.join('\n')}\n\nSubtotal: ₹${subtotal}\n\nPlease share payment & delivery details.`;
    const phone = '919511537448';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 flex items-center justify-center font-quicksand p-4">
        <div className="text-pink-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 font-quicksand">
      {/* Header - Hidden on mobile, shown on md+ */}
      <div className="hidden md:block p-6">
        <Header cartItemCount={cartItemCount} />
      </div>

      {/* MOBILE HEADER (sticky) - shows only on small screens */}
      <div className="md:hidden bg-transparent sticky top-0 z-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-pink-800">Woven Magic</h1>
            <p className="text-xs text-pink-600">Handmade crochet</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 shadow text-pink-700"
              aria-label="View cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
                <circle cx="10" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>
              <span className="sr-only">Cart</span>
              {cartItemCount > 0 && (
                <span className="text-xs bg-pink-600 text-white px-2 py-0.5 rounded-full">{cartItemCount}</span>
              )}
            </button>
            {user ? (
              <button
                onClick={() => navigate('/profile')}
                className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center"
                aria-label="Profile"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-700" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 10a4 4 0 100-8 4 4 0 000 8zM2 18a8 8 0 0116 0H2z" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-3 py-2 rounded-full border border-pink-200 text-pink-600 text-sm"
                aria-label="Login"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate(-1)} className="text-pink-600 text-sm">
              ‹ Back
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-pink-800">Your Cart</h1>
            <button onClick={clearCart} className="text-xs text-pink-500 hover:underline">
              Clear
            </button>
          </div>

          {cart.items?.length === 0 ? (
            <div className="py-12 text-center text-pink-500">
              <div className="text-lg font-semibold">Your cart is empty</div>
              <div className="mt-3 text-sm">Add some cute crochet items ✨</div>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => navigate('/')}
                  className="px-4 py-2 rounded-full bg-pink-600 text-white text-sm"
                >
                  Browse products
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {cart.items.map((item) => {
                  const itemId = user ? item._id : item.id;
                  const product = user ? item.product : item;
                  const quantity = user ? item.quantity : item.qty;
                  const price = product?.price || 0;

                  return (
                    <div
                      key={itemId}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border rounded-lg p-3"
                    >
                      <div className="w-full sm:w-28 flex-shrink-0">
                        {product?.images?.[0] ? (
                          <img
                            src={resolveImage(product.images[0])}
                            alt={product?.name}
                            className="w-full h-24 sm:h-20 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-full h-24 sm:h-20 bg-pink-100 rounded-md" />
                        )}
                      </div>

                      <div className="flex-1 w-full">
                        <div className="flex items-start sm:items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold text-pink-800 text-sm sm:text-base truncate">
                              {product?.name}
                            </div>
                            <div className="text-xs text-pink-500 mt-1">₹{price} each</div>
                          </div>

                          <div className="text-right mt-2 sm:mt-0">
                            <div className="font-bold text-pink-700">₹{price * quantity}</div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2 bg-pink-50 rounded-full px-2 py-1">
                            <button
                              onClick={() => updateQty(itemId, quantity - 1)}
                              className="px-3 py-1 rounded-full border border-pink-200 text-pink-600"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <div className="px-3 text-sm">{quantity}</div>
                            <button
                              onClick={() => updateQty(itemId, quantity + 1)}
                              className="px-3 py-1 rounded-full border border-pink-200 text-pink-600"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(itemId)}
                            className="text-xs text-pink-500 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 border-t pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="text-sm text-pink-500">Subtotal</div>
                  <div className="text-xl font-extrabold text-pink-700">₹{subtotal}</div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => navigate('/')}
                    className="w-full sm:w-auto px-4 py-2 rounded-full border border-pink-200 text-pink-600"
                  >
                    Continue shopping
                  </button>
                  <button
                    onClick={checkoutWhatsApp}
                    className="w-full sm:w-auto px-4 py-2 rounded-full bg-green-500 text-white"
                  >
                    Checkout via WhatsApp
                  </button>
                </div>
              </div>
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
