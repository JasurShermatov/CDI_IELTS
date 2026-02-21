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

const STATUS_CONFIG: Record<string, { label: string; badge: string; icon: string; btn: string; btnLabel: string }> = {
  not_started: { label: 'Not Started', badge: 'badge badge-neutral', icon: '⭕', btn: 'btn-primary', btnLabel: 'Start Test' },
  in_progress:  { label: 'In Progress',  badge: 'badge badge-warning', icon: '🔄', btn: 'btn-primary', btnLabel: 'Continue' },
  completed:    { label: 'Completed',    badge: 'badge badge-success', icon: '✅', btn: 'btn-secondary', btnLabel: 'View Results' },
};

export default function MyTestsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [tests, setTests] = useState<UserTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMock, setIsMock] = useState(false);
  const [filter, setFilter] = useState<'all' | 'not_started' | 'in_progress' | 'completed'>('all');

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
        const response = await api.get('/user-tests/my-tests/', { signal: controller.signal });
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="h-10 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
        <div className="h-5 bg-gray-100 rounded w-72 mb-8 animate-pulse" />
        <SkeletonCardGrid count={4} cols="md:grid-cols-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <span className="text-5xl mb-4 block">⚠️</span>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
      </div>
    );
  }

  const counts = {
    all: tests.length,
    not_started: tests.filter(t => t.status === 'not_started').length,
    in_progress: tests.filter(t => t.status === 'in_progress').length,
    completed: tests.filter(t => t.status === 'completed').length,
  };
  const filtered = filter === 'all' ? tests : tests.filter(t => t.status === filter);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in max-w-6xl">
      {isMock && (
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-yellow-100 text-yellow-800 px-4 py-1.5 text-sm font-semibold border border-yellow-200">
          ⚡ Demo data
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">My Tests</h1>
        <p className="text-gray-500 text-lg">Track your purchased IELTS practice tests</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { key: 'all',         label: 'Total',       icon: '📚', color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { key: 'not_started', label: 'Not Started', icon: '⭕', color: 'bg-gray-50 text-gray-700 border-gray-200' },
          { key: 'in_progress', label: 'In Progress', icon: '🔄', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
          { key: 'completed',   label: 'Completed',   icon: '✅', color: 'bg-green-50 text-green-700 border-green-200' },
        ].map(s => (
          <button key={s.key} onClick={() => setFilter(s.key as typeof filter)}
            className={`card border-2 ${s.color} flex items-center gap-4 py-5 text-left hover:opacity-90 transition-opacity ${filter === s.key ? 'ring-2 ring-offset-1 ring-current' : ''}`}>
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-extrabold">{counts[s.key as keyof typeof counts]}</p>
              <p className="text-xs font-medium opacity-80">{s.label}</p>
            </div>
          </button>
        ))}
      </div>

      {tests.length === 0 ? (
        <EmptyState icon="✍️" title="No tests yet"
          description="You haven't purchased any tests yet. Browse available tests to get started."
          actionLabel="Browse Tests" actionHref="/tests" />
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">
          No tests with status &quot;{filter.replace('_', ' ')}&quot;
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((userTest) => {
            const cfg = STATUS_CONFIG[userTest.status] || STATUS_CONFIG.not_started;
            return (
              <div key={userTest.id} className="card group hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{cfg.icon}</span>
                    <h3 className="text-base font-bold text-gray-900 leading-snug">{userTest.test.title}</h3>
                  </div>
                  <span className={`${cfg.badge} shrink-0 text-xs`}>{cfg.label}</span>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-3 mb-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Price Paid</p>
                    <p className="font-bold text-gray-900">{parseFloat(userTest.price_paid).toLocaleString()} <span className="text-xs font-normal text-gray-500">UZS</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Purchased</p>
                    <p className="font-semibold text-gray-700">{new Date(userTest.created_at).toLocaleDateString()}</p>
                  </div>
                  {userTest.started_at && (
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Started</p>
                      <p className="font-semibold text-gray-700">{new Date(userTest.started_at).toLocaleDateString()}</p>
                    </div>
                  )}
                  {userTest.completed_at && (
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Completed</p>
                      <p className="font-semibold text-green-700">{new Date(userTest.completed_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {/* Sections included */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {['📻 Listening', '📖 Reading', '✏️ Writing'].map(s => (
                    <span key={s} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1 font-medium">{s}</span>
                  ))}
                </div>

                <Link href={`/test/${userTest.id}`} className={`${cfg.btn} text-center text-sm mt-auto py-3 block`}>
                  {cfg.btnLabel}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
