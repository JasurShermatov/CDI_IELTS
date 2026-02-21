'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Payment } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';

const PRESET_AMOUNTS = [50_000, 100_000, 200_000, 500_000];

export default function PaymentPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const toast = useToast();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 1000 || numAmount > 5_000_000) {
      setError('Amount must be between 1,000 and 5,000,000 UZS');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post<Payment>('/payments/topup/', {
        amount: numAmount,
      });

      if (response.data.redirect_url) {
        toast.info('Redirecting to payment gateway...');
        window.location.href = response.data.redirect_url;
      } else {
        toast.success('Payment created successfully!');
        router.push('/dashboard');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.amount?.[0] ||
        'Failed to create payment';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-md mx-auto">
        <div className="card">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Top Up Balance
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleTopUp}>
            <div className="mb-4">
              <label htmlFor="amount" className="block text-gray-700 font-semibold mb-2">
                Amount (UZS)
              </label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50000"
                min="1000"
                max="5000000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold"
                required
              />
              <p className="text-xs text-gray-400 mt-2">
                Min: 1,000 UZS · Max: 5,000,000 UZS
              </p>
            </div>

            {/* Preset amount buttons */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  className={`py-2 px-1 rounded-lg text-sm font-medium transition-all ${amount === String(preset)
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {(preset / 1000).toFixed(0)}K
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !amount}
              className="btn-primary w-full text-lg py-3"
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h3 className="font-semibold mb-2 text-sm text-blue-900">Payment Information</h3>
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                You will be redirected to Click payment gateway
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                Payment is processed securely
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                Balance will be updated after successful payment
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
