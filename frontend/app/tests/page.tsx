'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Test } from '@/lib/types';
import { getMockTests } from '@/lib/mockData';
import { isMockEnabled } from '@/lib/mockMode';

export default function TestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (isMockEnabled()) {
      setTests(getMockTests());
      setIsMock(true);
      setLoading(false);
      return;
    }

    const fetchTests = async () => {
      try {
        const response = await api.get('/user-tests/all-tests/');
        if (Array.isArray(response.data) && response.data.length === 0) {
          setTests(getMockTests());
          setIsMock(true);
          return;
        }
        setTests(response.data);
      } catch (error) {
        console.error('Failed to fetch tests:', error);
        setTests(getMockTests());
        setIsMock(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [router]);

  const handlePurchase = async (testId: string) => {
    if (isMock) {
      alert('Demo mode: purchase simulated.');
      router.push('/my-tests');
      return;
    }
    try {
      await api.post(`/user-tests/purchase/${testId}/`);
      alert('Test purchased successfully!');
      router.push('/my-tests');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to purchase test');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {isMock && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-100 text-yellow-800 px-4 py-1 text-sm font-semibold">
          Demo data
        </div>
      )}
      <h1 className="text-3xl font-bold text-[var(--primary)] mb-6">
        Available Tests
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <div key={test.id} className="card">
            <h3 className="text-xl font-bold text-[var(--primary)] mb-2">
              {test.title}
            </h3>
            <p className="text-2xl font-bold text-gray-700 mb-4">
              {parseFloat(test.price).toLocaleString()} UZS
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Created: {new Date(test.created_at).toLocaleDateString()}
            </p>

            {test.purchased ? (
              <button className="btn-secondary w-full" disabled>
                Already Purchased
              </button>
            ) : (
              <button
                onClick={() => handlePurchase(test.id)}
                className="btn-primary w-full"
              >
                Purchase Test
              </button>
            )}
          </div>
        ))}
      </div>

      {tests.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No tests available at the moment.
        </div>
      )}
    </div>
  );
}
