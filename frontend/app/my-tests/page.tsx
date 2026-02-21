'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { UserTest } from '@/lib/types';
import { getMockMyTests } from '@/lib/mockData';
import { isMockEnabled } from '@/lib/mockMode';
import Link from 'next/link';

export default function MyTestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<UserTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (isMockEnabled()) {
      setTests(getMockMyTests());
      setIsMock(true);
      setLoading(false);
      return;
    }

    const fetchTests = async () => {
      try {
        const response = await api.get('/user-tests/my-tests/');
        if (Array.isArray(response.data) && response.data.length === 0) {
          setTests(getMockMyTests());
          setIsMock(true);
          return;
        }
        setTests(response.data);
      } catch (error) {
        console.error('Failed to fetch my tests:', error);
        setTests(getMockMyTests());
        setIsMock(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [router]);

  const getStatusBadge = (status: string) => {
    const badges = {
      not_started: 'bg-gray-200 text-gray-700',
      in_progress: 'bg-yellow-200 text-yellow-700',
      completed: 'bg-green-200 text-green-700',
    };
    return badges[status as keyof typeof badges] || badges.not_started;
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
        My Tests
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        {tests.map((userTest) => (
          <div key={userTest.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-[var(--primary)]">
                {userTest.test.title}
              </h3>
              <span
                className={`px-3 py-1 rounded text-sm font-semibold ${getStatusBadge(
                  userTest.status
                )}`}
              >
                {userTest.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <p className="text-gray-600 mb-2">
              Price Paid: {parseFloat(userTest.price_paid).toLocaleString()} UZS
            </p>
            {userTest.started_at && (
              <p className="text-gray-600 mb-2">
                Started: {new Date(userTest.started_at).toLocaleDateString()}
              </p>
            )}
            {userTest.completed_at && (
              <p className="text-gray-600 mb-4">
                Completed: {new Date(userTest.completed_at).toLocaleDateString()}
              </p>
            )}

            <Link
              href={`/test/${userTest.id}`}
              className="btn-primary inline-block text-center w-full"
            >
              {userTest.status === 'not_started'
                ? 'Start Test'
                : userTest.status === 'in_progress'
                ? 'Continue Test'
                : 'View Results'}
            </Link>
          </div>
        ))}
      </div>

      {tests.length === 0 && (
        <div className="text-center">
          <p className="text-gray-500 mb-4">
            You haven't purchased any tests yet.
          </p>
          <Link href="/tests" className="btn-primary inline-block">
            Browse Tests
          </Link>
        </div>
      )}
    </div>
  );
}
