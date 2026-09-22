'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { Eye, EyeOff, Shield } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token, refresh_token } = res.data;
      const meRes = await api.get('/auth/me', { headers: { Authorization: `Bearer ${access_token}` } });
      login(meRes.data, access_token, refresh_token);
      router.replace('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex w-1/2 bg-surface-dark items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-primary blur-[120px]" />
          <div className="absolute bottom-1/4 right-0 w-72 h-72 rounded-full bg-primary-light blur-[100px]" />
        </div>
        <div className="max-w-md text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-8 mx-auto shadow-lg shadow-primary/30">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-on-dark leading-tight tracking-tight mb-4 text-balance">
            Human Resource
            <br />
            Information System
          </h1>
          <p className="text-on-dark-soft text-base leading-relaxed">
            Manage your people, payroll, and workplace — all in one place.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-16 bg-canvas">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white text-sm font-bold">H</span>
            </div>
            <span className="text-lg font-bold text-ink tracking-tight">HRIS</span>
          </div>

          <h2 className="text-2xl font-bold text-ink mb-1">Welcome back</h2>
          <p className="text-sm text-muted mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-semantic-down font-medium" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-ink mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@hris.local"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-ink mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-11"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-soft hover:text-muted transition-colors min-h-11 min-w-11 flex items-center justify-center cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="text-[11px] text-muted-soft text-center mt-8 px-4 py-3 bg-surface-soft rounded-lg">
            Demo: <span className="font-mono font-medium text-muted">admin@hris.local</span> / <span className="font-mono font-medium text-muted">Admin123!</span>
          </p>
        </div>
      </div>
    </div>
  );
}
