import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = ({ cartItemCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="max-w-7xl mx-auto flex items-center justify-between mb-6">
      <Link to="/" className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-pink-200 flex items-center justify-center shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-700" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.657 3.172 11.83a4 4 0 010-5.657z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-pink-800 leading-tight">Woven Magic</h1>
          <p className="text-sm text-pink-600">Handmade flower crochet goods — cute & cozy</p>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link to="/dashboard" className="px-4 py-2 rounded-full bg-white border border-pink-100 shadow text-pink-700 hover:bg-pink-50 font-quicksand">
              Dashboard
            </Link>
            <button onClick={() => navigate('/cart')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-pink-100 shadow text-pink-700 hover:bg-pink-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
                <circle cx="10" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>
              <span className="font-semibold">Cart</span>
              {cartItemCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-pink-600 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>
            <button onClick={handleLogout} className="px-4 py-2 rounded-full bg-pink-600 text-white font-semibold hover:bg-pink-700 font-quicksand">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="px-4 py-2 rounded-full border border-pink-200 text-pink-600 font-quicksand">
              Login
            </Link>
            <Link to="/register" className="px-4 py-2 rounded-full bg-pink-600 text-white font-semibold hover:bg-pink-700 font-quicksand">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;

