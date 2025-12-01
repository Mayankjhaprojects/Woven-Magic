import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Header from '../components/Header';
import { resolveImage } from '../utils/imageHelper';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [] });
  const [favorites, setFavorites] = useState([]);
  const [favoritesSet, setFavoritesSet] = useState(new Set());
  const [orders, setOrders] = useState([]);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setError('');
      const productsRes = await api.get('/products');
      setProducts(productsRes.data || []);

      try {
        const [cartRes, favoritesRes, ordersRes] = await Promise.all([
          api.get('/cart'),
          api.get('/favorites'),
          api.get('/orders'),
        ]);
        setCart(cartRes.data || { items: [] });
        setFavorites(favoritesRes.data || []);
        setFavoritesSet(new Set((favoritesRes.data || []).map((p) => p._id)));
        setOrders(ordersRes.data || []);
        setCartItemCount(
          (cartRes.data?.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)
        );
      } catch (userError) {
        console.error('Error fetching user data:', userError);
        setCart({ items: [] });
        setFavorites([]);
        setFavoritesSet(new Set());
        setOrders([]);
        setCartItemCount(0);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(
        error.response?.data?.message ||
          error.message ||
          'Failed to load products. Please check if the backend server is running.'
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFav = async (productId) => {
    const isFavorited = favoritesSet.has(productId);
    // optimistic update
    setFavoritesSet((prev) => {
      const copy = new Set(prev);
      if (copy.has(productId)) copy.delete(productId);
      else copy.add(productId);
      return copy;
    });

    try {
      if (isFavorited) await api.delete(`/favorites/${productId}`);
      else await api.post('/favorites', { productId });

      const favoritesRes = await api.get('/favorites');
      setFavorites(favoritesRes.data || []);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      // revert on error
      setFavoritesSet((prev) => {
        const copy = new Set(prev);
        if (isFavorited) copy.add(productId);
        else copy.delete(productId);
        return copy;
      });
    }
  };

  const addToCart = async (product, qty = 1) => {
    try {
      await api.post('/cart', { productId: product._id, quantity: qty });
      await fetchData();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
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
      {/* Mobile compact header (visible only on phones) */}
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
              <span className="text-xs bg-pink-600 text-white px-2 py-0.5 rounded-full">{cartItemCount}</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center"
              aria-label="Profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-700" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 10a4 4 0 100-8 4 4 0 000 8zM2 18a8 8 0 0116 0H2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Header cartItemCount={cartItemCount} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-pink-800">Hi {user?.name || 'Friend'}!</h2>
          <p className="text-sm sm:text-base text-pink-600 mt-1">Welcome to your Woven Magic dashboard</p>
        </div>

        {/* Summaries stack on phone, side-by-side on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Cart Summary */}
          <div className="bg-white rounded-2xl shadow-md p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-pink-800">Your Cart</h3>
                <div className="text-xs text-pink-500">{cart.items?.length || 0} item(s)</div>
              </div>
              <button onClick={() => navigate('/cart')} className="text-sm text-pink-600 hover:underline">View</button>
            </div>

            {cart.items?.length > 0 ? (
              <>
                <div className="space-y-3 max-h-48 overflow-y-auto mb-3">
                  {cart.items.slice(0, 5).map((item) => (
                    <div key={item._id || `${item.product?._id}-${item.product?.name}`} className="flex items-center gap-3 p-2 bg-pink-50 rounded-lg">
                      {item.product?.images?.[0] ? (
                        <img src={resolveImage(item.product.images[0])} alt={item.product?.name} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 bg-pink-100 rounded-md" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-pink-800 truncate">{item.product?.name}</div>
                        <div className="text-xs text-pink-600">₹{item.product?.price} × {item.quantity}</div>
                      </div>
                      <div className="text-sm font-bold text-pink-700">₹{(item.product?.price || 0) * (item.quantity || 0)}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-pink-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-pink-500">Subtotal</div>
                    <div className="text-lg font-bold text-pink-800">
                      ₹{cart.items.reduce((sum, it) => sum + ((it.product?.price || 0) * (it.quantity || 0)), 0)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate('/cart')} className="px-3 py-2 rounded-full border border-pink-200 text-pink-600 text-sm">Manage</button>
                    <button onClick={() => navigate('/cart')} className="px-3 py-2 rounded-full bg-pink-600 text-white text-sm">Checkout</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-pink-500">
                <p>No items in cart</p>
                <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="mt-3 px-3 py-2 rounded-full bg-pink-600 text-white text-sm">Browse</button>
              </div>
            )}
          </div>

          {/* Favorites Summary */}
          <div className="bg-white rounded-2xl shadow-md p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-pink-800">Favorites</h3>
                <div className="text-xs text-pink-500">{favorites.length || 0} favorite(s)</div>
              </div>
              <button onClick={() => navigate('/')} className="text-sm text-pink-600 hover:underline">View</button>
            </div>

            {favorites.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {favorites.slice(0, 6).map((product) => (
                  <div key={product._id} onClick={() => navigate(`/preview/${product._id}`)} className="cursor-pointer p-2 bg-pink-50 rounded-md">
                    {product.images?.[0] ? (
                      <img src={resolveImage(product.images[0])} alt={product.name} className="w-full h-20 object-cover rounded-md mb-1" />
                    ) : (
                      <div className="w-full h-20 bg-pink-100 rounded-md mb-1" />
                    )}
                    <div className="text-xs font-medium text-pink-800 truncate">{product.name}</div>
                    <div className="text-xs text-pink-600">₹{product.price}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-pink-500">
                <p>No favorites yet</p>
                <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="mt-3 px-3 py-2 rounded-full bg-pink-600 text-white text-sm">Browse</button>
              </div>
            )}
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-pink-800">Your Orders</h3>
            <div />
          </div>

          {orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order._id} className="border border-pink-100 rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-semibold text-pink-800">Order #{order._id.slice(-6).toUpperCase()}</div>
                      <div className="text-xs text-pink-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-pink-700">₹{order.totalAmount}</div>
                      <div className="text-xs mt-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">{order.status}</div>
                    </div>
                  </div>
                  <div className="text-sm text-pink-600">
                    {order.items?.slice(0, 3).map((it, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{it.product?.name || 'Product'}</span>
                        <span>x{it.quantity}</span>
                      </div>
                    ))}
                    {order.items?.length > 3 && <div className="text-xs text-pink-500">+{order.items.length - 3} more</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-pink-500">
              <p>No orders yet</p>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-pink-800">Products</h3>
            <div className="text-sm text-pink-500">Showing {products.length} products</div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              <div className="text-sm font-semibold">Error loading products</div>
              <div className="text-xs">{error}</div>
              <button onClick={fetchData} className="mt-2 px-3 py-1 bg-red-600 text-white rounded-md text-sm">Retry</button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((p) => (
              <article key={p._id} className="bg-white rounded-2xl p-3 shadow flex flex-col">
                <div className="relative">
                  <img src={resolveImage(p.images?.[0])} alt={p.name} className="w-full h-40 sm:h-48 md:h-56 object-cover rounded-lg" />
                  <button
                    onClick={() => toggleFav(p._id)}
                    aria-label={favoritesSet.has(p._id) ? 'Remove favorite' : 'Add favorite'}
                    className={`absolute top-3 right-3 p-2 rounded-xl bg-white/80 shadow ${favoritesSet.has(p._id) ? 'ring-2 ring-pink-300' : ''}`}
                  >
                    {favoritesSet.has(p._id) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" viewBox="0 0 20 20" fill="currentColor"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.657 3.172 11.83a4 4 0 010-5.657z" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
                    )}
                  </button>
                </div>

                <div className="mt-3 flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-pink-800 truncate">{p.name}</h4>
                      <div className="text-xs text-pink-500 mt-1">Handmade • 100% cotton yarn</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-pink-700">₹{p.price}</div>
                      <div className="text-xs text-pink-400">Free shipping</div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col sm:flex-row gap-2">
                    <button onClick={() => addToCart(p, 1)} className="w-full sm:flex-1 px-3 py-2 rounded-full bg-pink-600 text-white font-semibold">Add to cart</button>
                    <button onClick={() => navigate(`/preview/${p._id}`)} className="w-full sm:w-auto px-3 py-2 rounded-full border border-pink-200 text-pink-600">Preview</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 text-center text-sm text-pink-500 pb-8">
        © {new Date().getFullYear()} Woven Magic — crafted with love and loops
      </footer>
    </div>
  );
};

export default Dashboard;
