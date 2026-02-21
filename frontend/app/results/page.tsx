'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { TestResult } from '@/lib/types';
import { getMockResults } from '@/lib/mockData';
import { isMockEnabled } from '@/lib/mockMode';
import { useAuth } from '@/lib/auth';
import { SkeletonTable } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';

function scoreClass(score?: number): string {
  if (!score) return '';
  if (score >= 7) return 'score-high';
  if (score >= 6) return 'score-mid';
  return 'score-low';
}

export default function ResultsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    if (isMockEnabled()) {
      setResults(getMockResults());
      setIsMock(true);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchResults = async () => {
      try {
        const response = await api.get('/user-tests/results/', {
          signal: controller.signal,
        });
        setResults(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        if (err.name === 'CanceledError') return;
        setError('Failed to load results.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
    return () => controller.abort();
  }, [authLoading, isAuthenticated]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
        <SkeletonTable rows={4} />
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Test Results</h1>

      {results.length === 0 ? (
        <EmptyState
          icon="📊"
          title="No results yet"
          description="Complete a test to see your results and scores here."
          actionLabel="Browse Tests"
          actionHref="/tests"
        />
      ) : (
        <div className="space-y-6">
          {results.map((result) => (
            <div key={result.id} className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {result.user_test.test.title}
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Listening', score: result.listening_score },
                  { label: 'Reading', score: result.reading_score },
                  { label: 'Writing', score: result.writing_score },
                  { label: 'Overall', score: result.overall_score, highlight: true },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`text-center py-4 px-3 rounded-xl ${item.highlight
                        ? 'bg-gradient-to-br from-red-50 to-red-100'
                        : 'bg-gray-50'
                      }`}
                  >
                    <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">
                      {item.label}
                    </div>
                    <div className={`text-2xl font-extrabold ${scoreClass(item.score)}`}>
                      {item.score?.toFixed(1) || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>

              {result.feedback && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <h4 className="font-semibold mb-1 text-sm text-blue-900">Teacher Feedback</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{result.feedback}</p>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-4">
                Completed {new Date(result.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
