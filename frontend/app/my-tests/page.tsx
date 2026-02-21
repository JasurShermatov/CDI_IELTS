'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { UserTest } from '@/lib/types';
import { getMockMyTests } from '@/lib/mockData';
import { isMockEnabled } from '@/lib/mockMode';
import { useAuth } from '@/lib/auth';
import { SkeletonCardGrid } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';

const STATUS_CONFIG: Record<string, { label: string; badge: string; icon: string }> = {
  not_started: { label: 'Not Started', badge: 'badge badge-neutral', icon: '○' },
  in_progress: { label: 'In Progress', badge: 'badge badge-warning', icon: '◐' },
  completed: { label: 'Completed', badge: 'badge badge-success', icon: '●' },
};

export default function MyTestsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [tests, setTests] = useState<UserTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    if (isMockEnabled()) {
      setTests(getMockMyTests());
      setIsMock(true);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchTests = async () => {
      try {
        const response = await api.get('/user-tests/my-tests/', {
          signal: controller.signal,
        });
        setTests(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        if (err.name === 'CanceledError') return;
        setError('Failed to load your tests.');
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
    return () => controller.abort();
  }, [authLoading, isAuthenticated]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 bg-gray-200 rounded w-40 mb-6 animate-pulse" />
        <SkeletonCardGrid count={4} cols="md:grid-cols-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <span className="text-5xl mb-4 block">⚠️</span>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {isMock && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-100 text-yellow-800 px-4 py-1 text-sm font-semibold">
          ⚡ Demo data
        </div>
      )}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Tests</h1>

      {tests.length === 0 ? (
        <EmptyState
          icon="✍️"
          title="No tests yet"
          description="You haven't purchased any tests yet. Browse available tests to get started."
          actionLabel="Browse Tests"
          actionHref="/tests"
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {tests.map((userTest) => {
            const config = STATUS_CONFIG[userTest.status] || STATUS_CONFIG.not_started;
            return (
              <div key={userTest.id} className="card group">
                <div className="flex justify-between items-start mb-3 gap-3">
                  <h3 className="text-lg font-bold text-gray-900 flex-1">
                    {userTest.test.title}
                  </h3>
                  <span className={config.badge}>
                    {config.icon} {config.label}
                  </span>
                </div>

                <div className="text-sm text-gray-500 space-y-1 mb-4">
                  <p>
                    Paid: <span className="font-medium text-gray-700">{parseFloat(userTest.price_paid).toLocaleString()} UZS</span>
                  </p>
                  {userTest.started_at && (
                    <p>
                      Started: {new Date(userTest.started_at).toLocaleDateString()}
                    </p>
                  )}
                  {userTest.completed_at && (
                    <p>
                      Completed: {new Date(userTest.completed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <Link
                  href={`/test/${userTest.id}`}
                  className="btn-primary inline-block text-center w-full text-sm"
                >
                  {userTest.status === 'not_started'
                    ? 'Start Test'
                    : userTest.status === 'in_progress'
                      ? 'Continue Test'
                      : 'View Results'}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
