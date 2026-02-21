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
        const response = await api.get('/user-tests/all-tests/', { signal: controller.signal });
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
      setTests(prev => prev.map(t => t.id === purchaseTarget.id ? { ...t, purchased: true } : t));
      setPurchaseTarget(null);
      return;
    }
    setPurchasing(true);
    try {
      await api.post(`/user-tests/purchase/${purchaseTarget.id}/`);
      toast.success('Test purchased successfully!');
      setTests(prev => prev.map(t => t.id === purchaseTarget.id ? { ...t, purchased: true } : t));
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to purchase test');
    } finally {
      setPurchasing(false);
      setPurchaseTarget(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="h-10 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
        <div className="h-5 bg-gray-100 rounded w-72 mb-8 animate-pulse" />
        <SkeletonCardGrid count={6} />
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

  const purchased = tests.filter(t => t.purchased);
  const available = tests.filter(t => !t.purchased);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in max-w-6xl">
      {isMock && (
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-yellow-100 text-yellow-800 px-4 py-1.5 text-sm font-semibold border border-yellow-200">
          ⚡ Demo data
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Available Tests</h1>
        <p className="text-gray-500 text-lg">Purchase and start your IELTS practice tests</p>
      </div>

      {/* Summary bar */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 flex items-center gap-3">
          <span className="text-2xl">📚</span>
          <div>
            <p className="text-2xl font-extrabold text-blue-700">{tests.length}</p>
            <p className="text-xs text-blue-600 font-medium">Total Tests</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="text-2xl font-extrabold text-green-700">{purchased.length}</p>
            <p className="text-xs text-green-600 font-medium">Purchased</p>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 flex items-center gap-3">
          <span className="text-2xl">🛒</span>
          <div>
            <p className="text-2xl font-extrabold text-orange-700">{available.length}</p>
            <p className="text-xs text-orange-600 font-medium">Available</p>
          </div>
        </div>
      </div>

      {tests.length === 0 ? (
        <EmptyState icon="📚" title="No tests available" description="New tests will appear here once they are published." />
      ) : (
        <>
          {purchased.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="badge badge-success">✓ Purchased</span>
                <span>My Tests</span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {purchased.map(test => (
                  <TestCard key={test.id} test={test} onPurchase={() => setPurchaseTarget(test)} />
                ))}
              </div>
            </div>
          )}

          {available.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">All Tests</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {available.map(test => (
                  <TestCard key={test.id} test={test} onPurchase={() => setPurchaseTarget(test)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!purchaseTarget}
        title="Confirm Purchase"
        description={purchaseTarget
          ? `Purchase "${purchaseTarget.title}" for ${parseFloat(purchaseTarget.price).toLocaleString()} UZS? Amount will be deducted from your balance.`
          : ''}
        confirmLabel="Purchase"
        loading={purchasing}
        onConfirm={handlePurchase}
        onCancel={() => setPurchaseTarget(null)}
      />
    </div>
  );
}

function TestCard({ test, onPurchase }: { test: Test; onPurchase: () => void }) {
  const price = parseFloat(test.price);
  return (
    <div className="card group hover:shadow-md transition-all hover:-translate-y-1 flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-3xl">📋</span>
        {test.purchased && <span className="badge badge-success text-xs shrink-0">✓ Owned</span>}
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-2 flex-1">{test.title}</h3>
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
        <span>📅 Added {new Date(test.created_at).toLocaleDateString()}</span>
      </div>
      <div className="mt-auto border-t pt-4 flex items-center justify-between">
        <div>
          <p className="text-2xl font-extrabold text-[var(--primary)]">{price.toLocaleString()}</p>
          <p className="text-xs text-gray-400 font-medium">UZS</p>
        </div>
        {test.purchased ? (
          <span className="badge badge-success px-4 py-2">✓ Purchased</span>
        ) : (
          <button onClick={onPurchase} className="btn-primary text-sm px-5 py-2.5">
            Buy Now
          </button>
        )}
      </div>
    </div>
  );
}
