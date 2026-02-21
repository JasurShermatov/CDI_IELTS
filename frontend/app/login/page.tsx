'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const toast = useToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/accounts/login/verify/', { code });

      login(response.data.access, response.data.refresh, response.data.role);
      toast.success('Login successful!');

      if (response.data.role === 'teacher') {
        router.push('/teacher/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const msg =
          data.detail ||
          data.non_field_errors?.[0] ||
          Object.values(data).flat().join(' ');
        setError(msg || 'Invalid or expired code');
      } else {
        setError('Invalid or expired code');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto animate-fade-in">
        <div className="card">
          <h1 className="text-3xl font-bold text-[var(--primary)] mb-6 text-center">
            Login
          </h1>

          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-5 py-4 rounded-lg mb-6">
            <h3 className="font-bold text-base mb-2">📱 How to login:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Open our <a href="https://t.me/impulse_cdi_bot" target="_blank" rel="noopener noreferrer" className="font-bold underline text-blue-600 hover:text-blue-800">online_mock</a></li>
              <li>Send <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-mono">/login</code> command</li>
              <li>You will receive a <strong>6-digit code</strong></li>
              <li>Enter the code below</li>
            </ol>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label htmlFor="code-input" className="block text-gray-700 font-semibold mb-2">
                Verification Code
              </label>
              <input
                id="code-input"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                autoComplete="one-time-code"
                inputMode="numeric"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-[0.5em] font-mono"
                required
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Enter the 6-digit code from Telegram
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="btn-primary w-full text-lg py-3 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/register" className="text-[var(--primary)] hover:underline font-medium text-sm">
              Don&apos;t have an account? Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
