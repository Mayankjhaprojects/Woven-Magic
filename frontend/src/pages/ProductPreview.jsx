import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { resolveImage } from '../utils/imageHelper';

export default function ProductPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const slideRef = useRef(null);

  // added: cart count to pass down to Header (so Header doesn't need to refetch)
  const [cartItemCount, setCartItemCount] = useState(null);

  // fetch product
  useEffect(() => {
    fetchProduct();
    // reset index & qty when id changes
    setIndex(0);
    setQty(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    // fetch cart count once (keeps header instant)
    let mounted = true;
    const fetchCartCount = async () => {
      try {
        const res = await api.get('/cart');
        if (!mounted) return;
        const items = res.data?.items || [];
        const count = items.reduce((s, it) => s + (it.quantity || 0), 0);
        setCartItemCount(count);
      } catch (err) {
        console.warn('Failed to load cart count in ProductPreview', err);
        if (mounted) setCartItemCount(0);
      }
    };
    fetchCartCount();
    return () => {
      mounted = false;
    };
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      // normalize: some backends return product in response.data or response.data.product
      const p = response.data?.product ?? response.data;
      setProduct(p);
    } catch (error) {
      console.error('Error fetching product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  // auto-scroll carousel (paused when isPaused true)
  useEffect(() => {
    if (isPaused || !(product?.images?.length > 1)) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % product.images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isPaused, product?.images?.length]);

  useEffect(() => {
    if (!product) return;
    if (index >= (product.images?.length || 0)) setIndex(0);
  }, [product, index]);

  const goto = (i) => {
    if (!product?.images?.length) return;
    setIndex(((i % product.images.length) + product.images.length) % product.images.length);
  };

  const changeQty = (delta) => setQty((q) => Math.max(1, q + delta));

  const addToCart = async () => {
    if (!product) return;
    if (user) {
      try {
        await api.post('/cart', { productId: product._id, quantity: qty });
        alert(`${product.name} (x${qty}) added to cart ✨`);
        // update local header count optimistically
        setCartItemCount((c) => (typeof c === 'number' ? c + qty : c));
      } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add to cart');
      }
    } else {
      const guestCart = JSON.parse(localStorage.getItem('pc_cart') || '[]');
      const existingIndex = guestCart.findIndex((item) => item.id === product._id);
      if (existingIndex >= 0) {
        guestCart[existingIndex].qty = (guestCart[existingIndex].qty || 0) + qty;
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
      alert(`${product.name} (x${qty}) added to cart ✨`);
      // update local header count for guest flow too
      setCartItemCount((c) => (typeof c === 'number' ? c + qty : c));
    }
  };

  const orderViaWhatsApp = () => {
    if (!product) return;
    const phone = '919511537448';
    const customerName = user?.name || 'Guest';
    const message = encodeURIComponent(
      `Hi! My name is ${customerName}.\n\nI'd like to order:\n${product.name} (Qty: ${qty}) - ₹${product.price * qty}\n\nTotal: ₹${product.price * qty}\n\nPlease let me know payment & delivery details.`
    );
    const url = `https://wa.me/${phone}?text=${message}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 flex items-center justify-center font-quicksand p-4">
        <div className="text-pink-600">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 flex items-center justify-center font-quicksand p-4">
        <div className="text-pink-600">Product not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 font-quicksand">
      {/* Header - pass cart count so the shared Header shows consistent count - Hidden on mobile, shown on md+ */}
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
              <span className="text-xs bg-pink-600 text-white px-2 py-0.5 rounded-full">{cartItemCount ?? 0}</span>
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

      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* DESKTOP / MD+ TOP (unchanged) */}
          <div className="hidden md:flex p-4 sm:p-5 border-b border-pink-50 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100"
                aria-label="Go back"
              >
                ‹ Back
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-pink-800 leading-tight">{product.name}</h1>
                <p className="text-xs sm:text-sm text-pink-500">Handmade • Cozy • Perfect for gifting</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg sm:text-xl font-extrabold text-pink-700">₹{product.price}</div>
              <div className="text-xs text-pink-400">Inclusive of taxes</div>
            </div>
          </div>

          {/* content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-6">
            {/* carousel column */}
            <div
              className="relative rounded-lg overflow-hidden bg-pink-50"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div
                className="h-56 sm:h-72 md:h-96 flex items-center justify-center bg-white cursor-pointer"
                onClick={() => setIsPaused((s) => !s)}
              >
                <img
                  ref={slideRef}
                  src={resolveImage(product.images?.[index])}
                  alt={`${product.name} image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500"
                />
              </div>

              {/* prev/next - visible on MD+ and also small icons on mobile */}
              <button
                onClick={() => goto(index - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow md:p-3"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                onClick={() => goto(index + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow md:p-3"
                aria-label="Next image"
              >
                ›
              </button>

              {/* indicators (small) */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-3 flex gap-2">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goto(i)}
                    className={`w-2.5 h-2.5 rounded-full ${i === index ? 'bg-pink-600' : 'bg-pink-200'}`}
                    aria-label={`Go to image ${i + 1}`}
                  />
                ))}
              </div>

              {/* thumbnails row - visible on md+ */}
              {product.images?.length > 1 && (
                <div className="hidden md:flex items-center gap-3 p-3 overflow-x-auto bg-transparent">
                  {product.images.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => goto(i)}
                      className={`flex-none w-20 h-14 rounded-lg overflow-hidden border ${i === index ? 'ring-2 ring-pink-300' : 'border-pink-100'}`}
                      aria-label={`Thumbnail ${i + 1}`}
                    >
                      <img src={resolveImage(src)} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* details & order column */}
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-pink-800 mb-2">About this item</h2>
                <p className="text-sm text-pink-600 leading-relaxed">{product.description || 'Handmade flower crochet item — cute & cozy'}</p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-pink-50 p-3 rounded-lg">
                    <div className="text-xs text-pink-500">Material</div>
                    <div className="font-bold text-pink-700">100% Cotton</div>
                  </div>
                  <div className="bg-pink-50 p-3 rounded-lg">
                    <div className="text-xs text-pink-500">Delivery</div>
                    <div className="font-bold text-pink-700">3-7 business days</div>
                  </div>
                  <div className="col-span-2 bg-pink-50 p-3 rounded-lg">
                    <div className="text-xs text-pink-500">Care</div>
                    <div className="font-bold text-pink-700">Hand wash gently • Dry flat</div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => changeQty(-1)}
                      className="px-3 py-2 text-pink-600 hover:bg-pink-50"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <div className="px-4 py-2 font-semibold text-sm">{qty}</div>
                    <button
                      onClick={() => changeQty(1)}
                      className="px-3 py-2 text-pink-600 hover:bg-pink-50"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <div className="ml-auto text-right">
                    <div className="text-xs text-pink-500">Price</div>
                    <div className="font-extrabold text-pink-700 text-lg">₹{product.price * qty}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={addToCart}
                    className="w-full py-3 rounded-full bg-pink-600 text-white font-semibold hover:bg-pink-700"
                  >
                    Add to cart
                  </button>

                  <button
                    onClick={orderViaWhatsApp}
                    className="w-full py-3 rounded-full bg-green-500 text-white font-semibold hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M20.52 3.48A11.78 11.78 0 0 0 12.04 0C5.64 0 .48 5.16.48 11.55c0 2.04.54 4.02 1.62 5.82L0 24l6.84-2.1a11.53 11.53 0 0 0 5.16 1.26h.02c6.4 0 11.56-5.16 11.56-11.55 0-3.1-1.2-6.03-3.06-8.13zM12 21.3c-1.56 0-3.12-.42-4.5-1.2l-.3-.18-4.08 1.26 1.32-3.96-.2-.3a9.7 9.7 0 0 1-1.62-5.37c0-5.34 4.38-9.72 9.78-9.72 2.58 0 5.04 1.02 6.9 2.88a9.64 9.64 0 0 1 2.88 6.84c0 5.34-4.38 9.72-9.78 9.72zm5.16-7.26c-.3-.18-1.74-.84-2.01-.96-.27-.12-.48-.18-.69.18-.21.36-.78.96-.96 1.14-.18.18-.36.21-.66.03-.3-.18-1.26-.48-2.4-1.53-.9-.78-1.5-1.74-1.68-2.04-.18-.3-.02-.48.15-.66.15-.15.33-.39.48-.57.15-.18.21-.3.33-.48.12-.18.06-.36-.03-.54-.09-.18-.69-1.65-.96-2.25-.24-.57-.48-.48-.69-.48h-.57c-.21 0-.54.09-.84.39-.3.3-1.11 1.08-1.11 2.64 0 1.56 1.14 3.06 1.29 3.24.15.18 2.25 3.45 5.43 4.83.76.33 1.35.54 1.8.69.75.24 1.44.21 1.98.12.6-.09 1.74-.72 1.98-1.41.24-.69.24-1.29.18-1.41-.06-.12-.27-.18-.57-.36z"/>
                    </svg>
                    Order via WhatsApp
                  </button>
                </div>

                <div className="mt-3 text-xs text-pink-500">Or contact us on Instagram @wovenmagic_by_poorva for custom orders.</div>
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="p-3 sm:p-4 border-t border-pink-50 text-right text-sm text-pink-500">
            © {new Date().getFullYear()} Woven Magic
          </div>
        </div>
      </div>
    </div>
  );
}
