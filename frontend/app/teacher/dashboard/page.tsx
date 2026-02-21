'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { TeacherDashboard } from '@/lib/types';

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<TeacherDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');

    if (!token || role !== 'teacher') {
      router.push('/login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const response = await api.get('/profiles/teacher/me/');
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
        Teacher Dashboard
      </h1>

      <div className="card mb-8">
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
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card hover:shadow-lg transition-shadow cursor-pointer"
             onClick={() => router.push('/teacher/checking')}>
          <h3 className="text-xl font-bold text-[var(--primary)] mb-2">
            📝 Checking Queue
          </h3>
          <p className="text-gray-600">
            View and check student writing submissions
          </p>
        </div>

        <div className="card bg-gray-50">
          <h3 className="text-xl font-bold text-[var(--primary)] mb-2">
            📊 Statistics
          </h3>
          <p className="text-gray-600">
            View your checking statistics and performance
          </p>
        </div>
      </div>
    </div>
  );
}
