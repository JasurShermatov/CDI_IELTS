'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { TestResult } from '@/lib/types';
import { getMockResults } from '@/lib/mockData';
import { isMockEnabled } from '@/lib/mockMode';
import { useAuth } from '@/lib/auth';
import { SkeletonTable } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';

function scoreBg(score?: number) {
  if (!score) return 'bg-gray-100 text-gray-500';
  if (score >= 7) return 'bg-green-100 text-green-700';
  if (score >= 6) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

function ScorePill({ label, score }: { label: string; score?: number }) {
  return (
    <div className={`rounded-xl p-4 text-center ${scoreBg(score)}`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">{label}</p>
      <p className="text-3xl font-extrabold">{score?.toFixed(1) ?? '—'}</p>
    </div>
  );
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
        const response = await api.get('/user-tests/results/', { signal: controller.signal });
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
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="h-10 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
        <div className="h-5 bg-gray-100 rounded w-64 mb-8 animate-pulse" />
        <SkeletonTable rows={4} />
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

  const avgOverall = results.length
    ? (results.reduce((s, r) => s + (r.overall_score ?? 0), 0) / results.length)
    : 0;
  const bestScore = results.length ? Math.max(...results.map(r => r.overall_score ?? 0)) : 0;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in max-w-5xl">
      {isMock && (
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-yellow-100 text-yellow-800 px-4 py-1.5 text-sm font-semibold border border-yellow-200">
          ⚡ Demo data
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Test Results</h1>
        <p className="text-gray-500 text-lg">Your IELTS practice scores and teacher feedback</p>
      </div>

      {results.length === 0 ? (
        <EmptyState icon="📊" title="No results yet"
          description="Complete a test to see your results and scores here."
          actionLabel="Browse Tests" actionHref="/tests" />
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-5 flex items-center gap-4">
              <span className="text-4xl">📊</span>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Tests Taken</p>
                <p className="text-4xl font-extrabold text-blue-800">{results.length}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
              <span className="text-4xl">⭐</span>
              <div>
                <p className="text-xs text-green-600 font-semibold uppercase tracking-wider">Best Score</p>
                <p className="text-4xl font-extrabold text-green-800">{bestScore.toFixed(1)}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-5 flex items-center gap-4">
              <span className="text-4xl">📈</span>
              <div>
                <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider">Average Score</p>
                <p className="text-4xl font-extrabold text-purple-800">{avgOverall.toFixed(1)}</p>
              </div>
            </div>
          </div>

          {/* Results list */}
          <div className="space-y-6">
            {results.map((result, idx) => (
              <div key={result.id} className="card hover:shadow-md transition-shadow">
                {/* Title bar */}
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                      <span className="badge badge-success text-xs">Completed</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{result.user_test.test.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(result.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  {result.overall_score && (
                    <div className={`shrink-0 rounded-2xl px-5 py-3 text-center ${scoreBg(result.overall_score)}`}>
                      <p className="text-xs font-semibold opacity-70">Overall</p>
                      <p className="text-3xl font-extrabold">{result.overall_score.toFixed(1)}</p>
                    </div>
                  )}
                </div>

                {/* Score pills */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <ScorePill label="Listening" score={result.listening_score} />
                  <ScorePill label="Reading" score={result.reading_score} />
                  <ScorePill label="Writing" score={result.writing_score} />
                </div>

                {/* Score band indicator */}
                {result.overall_score && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Band 1</span><span>Band 5</span><span>Band 9</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${result.overall_score >= 7 ? 'bg-green-500' : result.overall_score >= 6 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${(result.overall_score / 9) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Feedback */}
                {result.feedback && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">💬</span>
                      <h4 className="font-bold text-sm text-blue-900">Teacher Feedback</h4>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{result.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
