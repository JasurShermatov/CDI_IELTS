'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    fullname: '',
    phone_number: '',
    role: 'student' as 'student' | 'teacher',
  });
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleStartRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/accounts/register/start/', formData);
      setUserId(response.data.user_id);
      setOtpSent(true);
      toast.info('Verification code sent! Check your Telegram.');
    } catch (err: any) {
      const data = err.response?.data;
      if (data && typeof data === 'object' && !data.detail) {
        const messages = Object.values(data).flat().join(' ');
        setError(messages || 'Failed to start registration');
      } else {
        setError(data?.detail || 'Failed to start registration');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/accounts/register/verify/', {
        user_id: userId,
        code: otp,
      });

      login(response.data.access, response.data.refresh, response.data.role);
      toast.success('Registration complete! Welcome to CDI IELTS.');

      if (response.data.role === 'teacher') {
        router.push('/teacher/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to verify registration');
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
            Register
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm" role="alert">
              {error}
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleStartRegistration}>
              <div className="mb-4">
                <label htmlFor="fullname" className="block text-gray-700 font-semibold mb-2">
                  Full Name
                </label>
                <input
                  id="fullname"
                  type="text"
                  value={formData.fullname}
                  onChange={(e) =>
                    setFormData({ ...formData, fullname: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="phone" className="block text-gray-700 font-semibold mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  placeholder="+998901234567"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="role" className="block text-gray-700 font-semibold mb-2">
                  Role
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as 'student' | 'teacher',
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyRegistration}>
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 text-sm">
                Code sent to your Telegram. Please enter it below.
              </div>

              <div className="mb-6">
                <label htmlFor="otp" className="block text-gray-700 font-semibold mb-2">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-[0.5em] font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="btn-primary w-full"
              >
                {loading ? 'Verifying...' : 'Complete Registration'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp('');
                  setError('');
                }}
                className="btn-secondary w-full mt-3"
              >
                Change Information
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-[var(--primary)] hover:underline font-medium text-sm">
              Already have an account? Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
