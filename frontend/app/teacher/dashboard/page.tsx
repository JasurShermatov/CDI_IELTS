'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { TeacherDashboard } from '@/lib/types';
import { getMockTeacherDashboard } from '@/lib/mockData';
import { isMockEnabled } from '@/lib/mockMode';
import { useAuth } from '@/lib/auth';
import { SkeletonDashboard } from '@/components/Skeleton';
import Link from 'next/link';

export default function TeacherDashboardPage() {
  const { isAuthenticated, isLoading: authLoading, role } = useAuth();
  const [dashboard, setDashboard] = useState<TeacherDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    if (authLoading || !isAuthenticated || role !== 'teacher') return;

    if (isMockEnabled()) {
      setDashboard(getMockTeacherDashboard());
      setIsMock(true);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchDashboard = async () => {
      try {
        const response = await api.get('/profiles/teacher/dashboard/', {
          signal: controller.signal,
        });
        setDashboard(response.data);
      } catch (err: any) {
        if (err.name === 'CanceledError') return;
        setError('Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    return () => controller.abort();
  }, [authLoading, isAuthenticated, role]);

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

  const stats = [
    {
      label: 'New Submissions',
      value: dashboard.sections.all_writing?.count ?? 0,
      icon: '📝',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'In Checking',
      value: dashboard.sections.my_checking?.count ?? 0,
      icon: '🔍',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Checked',
      value: dashboard.sections.my_checked?.count ?? 0,
      icon: '✅',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {isMock && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-100 text-yellow-800 px-4 py-1 text-sm font-semibold">
          ⚡ Demo data
        </div>
      )}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Teacher Dashboard
      </h1>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className={`card ${stat.bg} border-transparent`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className={`text-3xl font-extrabold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Profile card */}
      <div className="card mb-8">
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
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Link href="/teacher/checking" className="card-interactive group">
          <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">
            📝
          </span>
          <h3 className="font-bold text-gray-900 mb-1">Checking Queue</h3>
          <p className="text-gray-500 text-sm">
            View and check student writing submissions
          </p>
        </Link>

        <div className="card bg-gray-50">
          <span className="text-3xl mb-3 block">📊</span>
          <h3 className="font-bold text-gray-900 mb-1">Statistics</h3>
          <p className="text-gray-500 text-sm">
            View your checking statistics and performance
          </p>
        </div>
      </div>
    </div>
  );
}
