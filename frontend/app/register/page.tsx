'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
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

  const handleStartRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/accounts/register/start/', formData);
      setUserId(response.data.user_id);
      setOtpSent(true);
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

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user_role', response.data.role);

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

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="card">
          <h1 className="text-3xl font-bold text-[var(--primary)] mb-6 text-center">
            Register
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleStartRegistration}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullname}
                  onChange={(e) =>
                    setFormData({ ...formData, fullname: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[var(--primary)]"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  placeholder="+998901234567"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[var(--primary)]"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as 'student' | 'teacher',
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[var(--primary)]"
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
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[var(--primary)]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Verifying...' : 'Complete Registration'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp('');
                }}
                className="btn-secondary w-full mt-2"
              >
                Change Information
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-[var(--primary)] hover:underline">
              Already have an account? Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
