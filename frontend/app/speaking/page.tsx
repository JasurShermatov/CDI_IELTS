'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { SpeakingRequest } from '@/lib/types';
import { getMockSpeakingRequests } from '@/lib/mockData';
import { isMockEnabled } from '@/lib/mockMode';

export default function SpeakingPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<SpeakingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (isMockEnabled()) {
      setRequests(getMockSpeakingRequests());
      setIsMock(true);
      setLoading(false);
      return;
    }

    fetchRequests();
  }, [router]);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/speaking/my/');
      if (Array.isArray(response.data) && response.data.length === 0) {
        setRequests(getMockSpeakingRequests());
        setIsMock(true);
        return;
      }
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch speaking requests:', error);
      setRequests(getMockSpeakingRequests());
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (isMock) {
      setCreating(true);
      const now = new Date().toISOString();
      setRequests((prev) => [
        {
          id: crypto.randomUUID(),
          status: 'created',
          requested_at: now,
          scheduled_at: null,
        },
        ...prev,
      ]);
      setCreating(false);
      alert('Demo mode: speaking request created.');
      return;
    }
    setCreating(true);
    try {
      await api.post('/speaking/request/');
      alert('Speaking request created successfully!');
      fetchRequests();
    } catch (error: any) {
      alert(error.response?.data?.error || error.response?.data?.detail || 'Failed to create request');
    } finally {
      setCreating(false);
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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[var(--primary)]">
            Speaking Practice
          </h1>
          <button
            onClick={handleCreateRequest}
            disabled={creating}
            className="btn-primary"
          >
            {creating ? 'Creating...' : 'Request Session'}
          </button>
        </div>

        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-700">
                    Status:{' '}
                    <span className="text-[var(--primary)]">
                      {request.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Requested:{' '}
                    {new Date(request.requested_at).toLocaleString()}
                  </p>
                  {request.scheduled_at && (
                    <p className="text-sm text-gray-600 mt-1">
                      Scheduled:{' '}
                      {new Date(request.scheduled_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {requests.length === 0 && (
          <div className="text-center card">
            <p className="text-gray-500 mb-4">
              No speaking requests yet. Create your first request!
            </p>
          </div>
        )}

        <div className="mt-8 card bg-blue-50">
          <h3 className="font-bold text-lg mb-3">How It Works</h3>
          <ol className="space-y-2 text-gray-700">
            <li>1. Click "Request Session" to schedule a speaking practice</li>
            <li>2. A teacher will review and schedule your session</li>
            <li>3. You'll be notified once your session is scheduled</li>
            <li>4. Join the session at the scheduled time</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
