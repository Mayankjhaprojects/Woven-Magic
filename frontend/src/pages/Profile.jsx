import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Header from '../components/Header';

const Profile = () => {
  const { user: authUser, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    if (authUser) {
      setName(authUser.name || '');
      setEmail(authUser.email || '');
    }
  }, [authUser]);

  useEffect(() => {
    // Fetch cart count for header
    const fetchCartCount = async () => {
      try {
        const res = await api.get('/cart');
        const items = res.data?.items || [];
        const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        setCartItemCount(count);
      } catch (err) {
        console.warn('Failed to load cart count in Profile', err);
        setCartItemCount(0);
      }
    };
    if (authUser) {
      fetchCartCount();
    }
  }, [authUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.put('/users/profile', { name, email });
      setMessage('Profile updated successfully!');
      await checkAuth();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

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

      <div className="p-4 sm:p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-pink-800 mb-6">Edit Profile</h1>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg ${
              message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-pink-700 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:ring-2 focus:ring-pink-300 focus:border-transparent text-pink-700"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-pink-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:ring-2 focus:ring-pink-300 focus:border-transparent text-pink-700"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-lg border border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              Cancel
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

