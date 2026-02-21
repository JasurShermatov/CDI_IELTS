'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { StudentDashboard } from '@/lib/types';
import { getMockStudentDashboard } from '@/lib/mockData';
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
        const response = await api.get('/profiles/student/dashboard/', {
          signal: controller.signal,
        });
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
    return (
      <div className="container mx-auto px-4 py-8">
        <SkeletonDashboard />
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

  if (!dashboard) return null;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {isMock && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-100 text-yellow-800 px-4 py-1 text-sm font-semibold">
          ⚡ Demo data
        </div>
      )}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Welcome back, <span className="text-[var(--primary)]">{dashboard.profile.user.fullname.split(' ')[0]}</span>
      </h1>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Profile Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-sm w-20">Name</span>
              <span className="font-medium">{dashboard.profile.user.fullname}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-sm w-20">Phone</span>
              <span className="font-medium">{dashboard.profile.user.phone_number}</span>
            </div>
            {dashboard.profile.user.telegram_username && (
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-sm w-20">Telegram</span>
                <span className="font-medium">@{dashboard.profile.user.telegram_username}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-sm w-20">Status</span>
              {dashboard.profile.is_approved ? (
                <span className="badge badge-success">✓ Approved</span>
              ) : (
                <span className="badge badge-warning">⏳ Pending</span>
              )}
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
          <h2 className="text-lg font-bold mb-2 text-[var(--primary)]">
            Balance
          </h2>
          <p className="text-4xl font-extrabold text-[var(--primary)] mb-1 tracking-tight">
            {parseFloat(dashboard.profile.balance).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mb-4">UZS</p>
          <Link
            href="/payment"
            className="btn-primary inline-block text-sm"
          >
            Top Up Balance
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: '/tests', icon: '📚', title: 'Browse Tests', desc: 'View and purchase available tests' },
          { href: '/my-tests', icon: '✍️', title: 'My Tests', desc: 'Access your purchased tests' },
          { href: '/results', icon: '📊', title: 'Results', desc: 'View scores and feedback' },
          { href: '/speaking', icon: '🗣️', title: 'Speaking', desc: 'Request speaking sessions' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card-interactive group"
          >
            <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">
              {item.icon}
            </span>
            <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
            <p className="text-gray-500 text-sm">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
