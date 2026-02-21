'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Payment } from '@/lib/types';

export default function PaymentPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post<Payment>('/payments/topup/', {
        amount: parseFloat(amount),
      });

      if (response.data.redirect_url) {
        window.location.href = response.data.redirect_url;
      } else {
        alert('Payment created successfully!');
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.amount?.[0] ||
          'Failed to create payment'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="card">
          <h1 className="text-3xl font-bold text-[var(--primary)] mb-6 text-center">
            Top Up Balance
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleTopUp}>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Amount (UZS)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50000"
                min="1000"
                max="5000000"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[var(--primary)]"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Minimum: 1,000 UZS | Maximum: 5,000,000 UZS
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded">
            <h3 className="font-semibold mb-2">Payment Information</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• You will be redirected to Click payment gateway</li>
              <li>• Payment is processed securely</li>
              <li>• Balance will be updated after successful payment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
