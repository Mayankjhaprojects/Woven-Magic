import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { resolveImage } from '../utils/imageHelper';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [cartItemCount, setCartItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchUserData();
    } else {
      // Load guest favorites from localStorage
      const guestFavorites = JSON.parse(localStorage.getItem('pc_favorites') || '[]');
      setFavorites(new Set(guestFavorites));
      // load guest cart count
      const guestCart = JSON.parse(localStorage.getItem('pc_cart') || '[]');
      setCartItemCount(guestCart.reduce((s, it) => s + (it.qty || 0), 0));
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const [cartRes, favoritesRes] = await Promise.all([api.get('/cart'), api.get('/favorites')]);
      setCartItemCount(cartRes.data.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0);
      setFavorites(new Set((favoritesRes.data || []).map((p) => p._id)));
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const toggleFav = async (productId) => {
    const isFavorited = favorites.has(productId);

    if (user) {
      try {
        if (isFavorited) {
          await api.delete(`/favorites/${productId}`);
        } else {
          await api.post('/favorites', { productId });
        }
        setFavorites((prev) => {
          const copy = new Set(prev);
          if (copy.has(productId)) copy.delete(productId);
          else copy.add(productId);
          return copy;
        });
      } catch (error) {
        console.error('Error toggling favorite:', error);
      }
    } else {
      // Guest: use localStorage
      const guestFavorites = JSON.parse(localStorage.getItem('pc_favorites') || '[]');
      if (isFavorited) {
        const updated = guestFavorites.filter((id) => id !== productId);
        localStorage.setItem('pc_favorites', JSON.stringify(updated));
        setFavorites(new Set(updated));
      } else {
        guestFavorites.push(productId);
        localStorage.setItem('pc_favorites', JSON.stringify(guestFavorites));
        setFavorites(new Set(guestFavorites));
      }
    }
  };

  const addToCart = async (product, qty = 1) => {
    if (user) {
      try {
        await api.post('/cart', { productId: product._id, quantity: qty });
        await fetchUserData();
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    } else {
      // Guest: use localStorage
      const guestCart = JSON.parse(localStorage.getItem('pc_cart') || '[]');
      const existingIndex = guestCart.findIndex((item) => item.id === product._id);
      if (existingIndex >= 0) {
        guestCart[existingIndex].qty += qty;
      } else {
        guestCart.push({
          id: product._id,
          name: product.name,
          price: product.price,
          img: product.images?.[0] || '',
          qty,
        });
      }
      localStorage.setItem('pc_cart', JSON.stringify(guestCart));
      setCartItemCount(guestCart.reduce((sum, item) => sum + item.qty, 0));
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 flex items-center justify-center font-quicksand p-4">
        <div className="text-pink-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 font-quicksand">
      {/* Mobile compact header */}
      <div className="md:hidden sticky top-0 z-20 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-pink-800">Woven Magic</h1>
            <p className="text-xs text-pink-600">Handmade crochet</p>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={() => navigate('/dashboard')}
                className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center"
                aria-label="Dashboard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-700" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </button>
            )}
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-white shadow text-pink-700"
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

      {/* Desktop header */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Header cartItemCount={cartItemCount} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar (collapses to top card on small screens) */}
        <aside className="order-1 lg:order-1 lg:col-span-1">
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-pink-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-700" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.657 3.172 11.83a4 4 0 010-5.657z" />
                </svg>
              </div>
              <div>
                <div className="text-base font-semibold text-pink-800">Poorvika</div>
                <div className="text-xs text-pink-500">Founder • Crochet Artist</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-3 rounded-lg bg-pink-50 text-center">
                <div className="text-xs text-pink-500">Products</div>
                <div className="font-bold text-pink-700 text-lg">{products.length}</div>
              </div>
              <div className="p-3 rounded-lg bg-pink-50 text-center">
                <div className="text-xs text-pink-500">Favorites</div>
                <div className="font-bold text-pink-700 text-lg">{favorites.size}</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-pink-50 text-center">
              <div className="text-xs text-pink-500">Contact</div>
              <div className="font-bold text-pink-700 text-lg">Reach Us</div>
            </div>

            {/* Search for small screens inside sidebar for compact layout */}
            <div className="mt-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full py-2 px-3 rounded-full border-0 shadow-sm focus:ring-2 focus:ring-pink-300 text-pink-700 bg-white"
              />
            </div>
          </div>
        </aside>

        {/* Products area */}
        <section className="order-2 lg:order-2 lg:col-span-3">
          {/* Search bar for desktop */}
          <div className="hidden md:flex items-center justify-between mb-4 gap-4">
            <div className="flex-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full py-3 px-4 rounded-full border-0 shadow-sm focus:ring-2 focus:ring-pink-300 text-pink-700 bg-white"
              />
            </div>
            <div className="ml-4">
              <button onClick={() => navigate('/cart')} className="px-4 py-2 rounded-full bg-white border border-pink-100 shadow text-pink-700">
                View Cart <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-pink-600 rounded-full">{cartItemCount}</span>
              </button>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-pink-800">Products</h2>
            <div className="text-sm text-pink-500">Showing {filtered.length} of {products.length}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <article key={p._id} className="bg-white rounded-2xl p-3 sm:p-4 shadow hover:shadow-lg transition-shadow flex flex-col">
                <div className="relative">
                  <img
                    src={resolveImage(p.images?.[0])}
                    alt={p.name}
                    className="w-full h-40 sm:h-44 md:h-48 object-cover rounded-lg"
                  />

                  <button
                    onClick={() => toggleFav(p._id)}
                    aria-label={favorites.has(p._id) ? 'Remove favorite' : 'Add favorite'}
                    className={`absolute top-3 right-3 p-2 rounded-xl bg-white/90 shadow ${favorites.has(p._id) ? 'ring-2 ring-pink-300' : ''}`}
                  >
                    {favorites.has(p._id) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.657 3.172 11.83a4 4 0 010-5.657z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="mt-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-pink-800 truncate">{p.name}</h3>
                    <p className="text-xs text-pink-500 mt-1">Handmade • 100% cotton yarn</p>
                  </div>
                  <div className="text-right ml-2">
                    <div className="font-bold text-pink-700">₹{p.price}</div>
                    <div className="text-xs text-pink-400">Free shipping</div>
                  </div>
                </div>

                <div className="mt-3 flex flex-col sm:flex-row items-stretch gap-3">
                  <button
                    onClick={() => addToCart(p, 1)}
                    className="w-full sm:flex-1 py-2 rounded-full bg-pink-600 text-white font-semibold hover:bg-pink-700"
                  >
                    Add to cart
                  </button>
                  <button
                    onClick={() => navigate(`/preview/${p._id}`)}
                    className="w-full sm:w-auto py-2 px-3 rounded-full border border-pink-200 text-pink-600"
                  >
                    Preview
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 text-center text-sm text-pink-500 pb-8">
        © {new Date().getFullYear()} Woven Magic — crafted with love and loops
      </footer>
    </div>
  );
}
