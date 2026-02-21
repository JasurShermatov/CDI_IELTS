'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { StudentDashboard } from '@/lib/types';
import { getMockStudentDashboard, getMockMyTests, getMockResults } from '@/lib/mockData';
import { isMockEnabled } from '@/lib/mockMode';
import { useAuth } from '@/lib/auth';
import { SkeletonDashboard } from '@/components/Skeleton';
import Link from 'next/link';

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    if (isMockEnabled()) {
      setDashboard(getMockStudentDashboard());
      setIsMock(true);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/profiles/student/dashboard/', { signal: controller.signal });
        setDashboard(response.data);
      } catch (err: any) {
        if (err.name === 'CanceledError') return;
        setError('Failed to load dashboard. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
    return () => controller.abort();
  }, [authLoading, isAuthenticated]);

  if (authLoading || loading) {
    return <div className="container mx-auto px-4 py-8"><SkeletonDashboard /></div>;
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

  if (!dashboard) return null;

  const mockTests = isMock ? getMockMyTests() : [];
  const mockResults = isMock ? getMockResults() : [];
  const balance = parseFloat(dashboard.profile.balance || '0');
  const recentTests = mockTests.slice(0, 3);

  const stats = [
    { icon: '📚', label: 'Tests Purchased', value: isMock ? mockTests.length : '—', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { icon: '✅', label: 'Completed', value: isMock ? mockTests.filter(t => t.status === 'completed').length : '—', color: 'bg-green-50 text-green-700 border-green-200' },
    { icon: '📊', label: 'Avg Score', value: isMock && mockResults.length ? (mockResults.reduce((s, r) => s + (r.overall_score || 0), 0) / mockResults.length).toFixed(1) : '—', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { icon: '🗣️', label: 'Speaking Sessions', value: isMock ? '5' : '—', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in max-w-6xl">
      {isMock && (
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-yellow-100 text-yellow-800 px-4 py-1.5 text-sm font-semibold border border-yellow-200">
          ⚡ Demo data — mock mode enabled
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-1">
          Welcome back, <span className="text-[var(--primary)]">{dashboard.profile.user.fullname.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-gray-500 text-lg">Here's your IELTS preparation overview</p>
      </div>

      {/* Top row: balance + stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Balance card – large */}
        <div className="lg:col-span-1 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between min-h-[160px]">
          <div>
            <p className="text-red-200 text-sm font-medium uppercase tracking-wider mb-1">Current Balance</p>
            <p className="text-5xl font-extrabold tracking-tight">{balance.toLocaleString()}</p>
            <p className="text-red-200 text-sm mt-1">UZS</p>
          </div>
          <Link href="/payment" className="mt-4 inline-block bg-white text-red-700 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors w-fit">
            + Top Up Balance
          </Link>
        </div>

        {/* Profile card */}
        <div className="card flex flex-col justify-between min-h-[160px]">
          <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="text-2xl">👤</span> Profile
          </h2>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-xs w-20 shrink-0">Full Name</span>
              <span className="font-semibold text-sm truncate">{dashboard.profile.user.fullname}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-xs w-20 shrink-0">Phone</span>
              <span className="font-semibold text-sm">{dashboard.profile.user.phone_number}</span>
            </div>
            {dashboard.profile.user.telegram_username && (
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-xs w-20 shrink-0">Telegram</span>
                <span className="font-semibold text-sm">@{dashboard.profile.user.telegram_username}</span>
              </div>
            )}
          </div>
          <div className="mt-3">
            {dashboard.profile.is_approved
              ? <span className="badge badge-success text-xs">✓ Approved</span>
              : <span className="badge badge-warning text-xs">⏳ Pending Approval</span>
            }
          </div>
        </div>

        {/* Quick actions */}
        <div className="card min-h-[160px]">
          <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="text-2xl">⚡</span> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: '/tests', icon: '📚', label: 'Browse Tests' },
              { href: '/my-tests', icon: '✍️', label: 'My Tests' },
              { href: '/results', icon: '📊', label: 'Results' },
              { href: '/speaking', icon: '🗣️', label: 'Speaking' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 hover:bg-red-50 hover:text-red-700 transition-colors text-sm font-medium">
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs font-semibold">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className={`card border-2 ${stat.color} flex items-center gap-4 py-5`}>
            <span className="text-3xl">{stat.icon}</span>
            <div>
              <p className="text-2xl font-extrabold">{stat.value}</p>
              <p className="text-xs font-medium opacity-80">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent tests */}
      {recentTests.length > 0 && (
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-gray-900">Recent Tests</h2>
            <Link href="/my-tests" className="text-sm text-[var(--primary)] font-semibold hover:underline">View all →</Link>
          </div>
          <div className="divide-y">
            {recentTests.map(test => {
              const statusConfig: Record<string, { badge: string; icon: string }> = {
                completed: { badge: 'badge-success', icon: '✅' },
                in_progress: { badge: 'badge-warning', icon: '🔄' },
                not_started: { badge: 'badge-neutral', icon: '⭕' },
              };
              const conf = statusConfig[test.status] || statusConfig.not_started;
              return (
                <div key={test.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl">{conf.icon}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{test.test.title}</p>
                      <p className="text-xs text-gray-400">Purchased {new Date(test.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`badge ${conf.badge} text-xs`}>{test.status.replace('_', ' ')}</span>
                    {test.status !== 'not_started' && (
                      <Link href={`/test/${test.id}`} className="btn-primary text-xs px-3 py-1.5">Continue</Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent results */}
      {mockResults.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-gray-900">Latest Results</h2>
            <Link href="/results" className="text-sm text-[var(--primary)] font-semibold hover:underline">View all →</Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {mockResults.slice(0, 2).map(result => (
              <div key={result.id} className="bg-gray-50 rounded-xl p-4 border">
                <p className="font-bold text-sm mb-3 truncate">{result.user_test.test.title}</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'L', score: result.listening_score },
                    { label: 'R', score: result.reading_score },
                    { label: 'W', score: result.writing_score },
                    { label: '∑', score: result.overall_score },
                  ].map(s => (
                    <div key={s.label} className="text-center bg-white rounded-lg py-2">
                      <p className="text-[10px] text-gray-500 font-medium">{s.label}</p>
                      <p className={`text-lg font-extrabold ${s.score && s.score >= 7 ? 'text-green-600' : s.score && s.score >= 6 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {s.score?.toFixed(1) || '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
