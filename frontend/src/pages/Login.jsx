import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, mergeGuestData } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        await mergeGuestData?.();
        navigate('/dashboard');
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch (err) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 flex items-center justify-center p-4 sm:p-6 font-quicksand">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        {/* logo + title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 rounded-2xl bg-pink-200 flex items-center justify-center shadow-md mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-700" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.657 3.172 11.83a4 4 0 010-5.657z" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-pink-800 leading-tight">Welcome Back</h1>
          <p className="text-sm sm:text-base text-pink-600 mt-1">Login to your Woven Magic account</p>
        </div>

        {/* error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-pink-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:ring-2 focus:ring-pink-300 focus:border-transparent text-pink-700 placeholder-pink-300"
              placeholder="you@example.com"
              aria-label="Email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-pink-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:ring-2 focus:ring-pink-300 focus:border-transparent text-pink-700 placeholder-pink-300"
              placeholder="••••••••"
              aria-label="Password"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-pink-600">
              <input type="checkbox" className="h-4 w-4 rounded border-pink-200 text-pink-600 focus:ring-pink-300" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot" className="text-pink-600 hover:underline">
              Forgot?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            aria-busy={loading}
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        {/* signup */}
        <div className="mt-5 text-center text-sm text-pink-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-pink-700 hover:underline">
            Sign up
          </Link>
        </div>

        {/* small note for mobile spacing */}
        <div className="mt-4 text-center text-xs text-pink-400">
          By logging in you agree to our Terms & Privacy.
        </div>
      </div>
    </div>
  );
};

export default Login;
