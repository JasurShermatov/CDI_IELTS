'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Test } from '@/lib/types';
import { getMockTests } from '@/lib/mockData';
import { isMockEnabled } from '@/lib/mockMode';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { SkeletonCardGrid } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function TestsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const toast = useToast();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMock, setIsMock] = useState(false);
  const [purchaseTarget, setPurchaseTarget] = useState<Test | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    if (isMockEnabled()) {
      setTests(getMockTests());
      setIsMock(true);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchTests = async () => {
      try {
        const response = await api.get('/user-tests/all-tests/', {
          signal: controller.signal,
        });
        setTests(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        if (err.name === 'CanceledError') return;
        setError('Failed to load tests. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
    return () => controller.abort();
  }, [authLoading, isAuthenticated]);

  const handlePurchase = async () => {
    if (!purchaseTarget) return;

    if (isMock) {
      toast.success('Demo mode: purchase simulated.');
      setPurchaseTarget(null);
      return;
    }

    setPurchasing(true);
    try {
      await api.post(`/user-tests/purchase/${purchaseTarget.id}/`);
      toast.success('Test purchased successfully!');
      // Mark as purchased locally
      setTests((prev) =>
        prev.map((t) =>
          t.id === purchaseTarget.id ? { ...t, purchased: true } : t,
        ),
      );
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to purchase test');
    } finally {
      setPurchasing(false);
      setPurchaseTarget(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
        <SkeletonCardGrid count={6} />
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Available Tests
      </h1>

      {tests.length === 0 ? (
        <EmptyState
          icon="📚"
          title="No tests available"
          description="New tests will appear here once they are published."
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <div key={test.id} className="card group">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {test.title}
              </h3>
              <p className="text-2xl font-extrabold text-[var(--primary)] mb-1">
                {parseFloat(test.price).toLocaleString()} <span className="text-sm font-medium text-gray-500">UZS</span>
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Added {new Date(test.created_at).toLocaleDateString()}
              </p>

              {test.purchased ? (
                <span className="badge badge-success w-full justify-center py-2">
                  ✓ Already Purchased
                </span>
              ) : (
                <button
                  onClick={() => setPurchaseTarget(test)}
                  className="btn-primary w-full text-sm"
                >
                  Purchase Test
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Purchase confirmation dialog */}
      <ConfirmDialog
        open={!!purchaseTarget}
        title="Confirm Purchase"
        description={
          purchaseTarget
            ? `Are you sure you want to purchase "${purchaseTarget.title}" for ${parseFloat(purchaseTarget.price).toLocaleString()} UZS? This amount will be deducted from your balance.`
            : ''
        }
        confirmLabel="Purchase"
        loading={purchasing}
        onConfirm={handlePurchase}
        onCancel={() => setPurchaseTarget(null)}
      />
    </div>
  );
}
