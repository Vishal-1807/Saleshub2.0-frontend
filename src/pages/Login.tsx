import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, clearError } from '../store/slices/authSlice';
import { UserCircle, Lock, Database } from 'lucide-react';

export default function Login() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-lg rounded-2xl mb-6 border border-white/20">
              <Database className="w-10 h-10 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Saleshub 2.0</h1>
            <p className="text-blue-200 text-lg">Sign in to continue</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Email</label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400/50" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg py-3 font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs text-blue-200 font-semibold mb-2">Demo Accounts:</p>
              <div className="space-y-1 text-xs text-blue-300/80">
                <p>Campaign Manager: manager@leadbyte.com</p>
                <p>Field Agent: agent1@leadbyte.com</p>
                <p>Call Center: callcenter@leadbyte.com</p>
                <p className="mt-2 text-blue-400 font-medium">Password: demo123</p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
