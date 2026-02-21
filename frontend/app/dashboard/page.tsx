'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { StudentDashboard } from '@/lib/types';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const response = await api.get('/profiles/student/me/');
        setDashboard(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[var(--primary)] mb-6">
        Dashboard
      </h1>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Profile Information</h2>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Name:</span>{' '}
              {dashboard.profile.user.fullname}
            </p>
            <p>
              <span className="font-semibold">Phone:</span>{' '}
              {dashboard.profile.user.phone_number}
            </p>
            {dashboard.profile.user.telegram_username && (
              <p>
                <span className="font-semibold">Telegram:</span>{' '}
                {dashboard.profile.user.telegram_username}
              </p>
            )}
            <p>
              <span className="font-semibold">Status:</span>{' '}
              {dashboard.profile.is_approved ? (
                <span className="text-green-600">Approved</span>
              ) : (
                <span className="text-yellow-600">Pending Approval</span>
              )}
            </p>
          </div>
        </div>

        <div className="card bg-[var(--primary-light)]">
          <h2 className="text-xl font-bold mb-4 text-[var(--primary)]">
            Balance
          </h2>
          <p className="text-4xl font-bold text-[var(--primary)]">
            {parseFloat(dashboard.profile.balance).toLocaleString()} UZS
          </p>
          <Link
            href="/payment"
            className="btn-primary inline-block mt-4"
          >
            Top Up Balance
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/tests" className="card hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-bold text-[var(--primary)] mb-2">
            📚 Browse Tests
          </h3>
          <p className="text-gray-600">
            View and purchase available IELTS practice tests
          </p>
        </Link>

        <Link
          href="/my-tests"
          className="card hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-bold text-[var(--primary)] mb-2">
            ✍️ My Tests
          </h3>
          <p className="text-gray-600">Access your purchased tests and continue practice</p>
        </Link>

        <Link
          href="/results"
          className="card hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-bold text-[var(--primary)] mb-2">
            📊 Results
          </h3>
          <p className="text-gray-600">View your test results and scores</p>
        </Link>

        <Link
          href="/speaking"
          className="card hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-bold text-[var(--primary)] mb-2">
            🗣️ Speaking
          </h3>
          <p className="text-gray-600">Request speaking practice sessions</p>
        </Link>
      </div>
    </div>
  );
}
