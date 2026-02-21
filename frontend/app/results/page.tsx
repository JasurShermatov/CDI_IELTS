'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { TestResult } from '@/lib/types';

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchResults = async () => {
      try {
        const response = await api.get('/user-tests/results/');
        setResults(response.data);
      } catch (error) {
        console.error('Failed to fetch results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[var(--primary)] mb-6">
        Test Results
      </h1>

      <div className="space-y-6">
        {results.map((result) => (
          <div key={result.id} className="card">
            <h3 className="text-xl font-bold text-[var(--primary)] mb-4">
              {result.user_test.test.title}
            </h3>

            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-600 mb-1">Listening</div>
                <div className="text-2xl font-bold text-[var(--primary)]">
                  {result.listening_score?.toFixed(1) || 'N/A'}
                </div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-600 mb-1">Reading</div>
                <div className="text-2xl font-bold text-[var(--primary)]">
                  {result.reading_score?.toFixed(1) || 'N/A'}
                </div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-600 mb-1">Writing</div>
                <div className="text-2xl font-bold text-[var(--primary)]">
                  {result.writing_score?.toFixed(1) || 'N/A'}
                </div>
              </div>

              <div className="text-center p-4 bg-[var(--primary-light)] rounded">
                <div className="text-sm text-gray-600 mb-1">Overall</div>
                <div className="text-2xl font-bold text-[var(--primary)]">
                  {result.overall_score?.toFixed(1) || 'N/A'}
                </div>
              </div>
            </div>

            {result.feedback && (
              <div className="mt-4 p-4 bg-blue-50 rounded">
                <h4 className="font-semibold mb-2">Feedback:</h4>
                <p className="text-gray-700">{result.feedback}</p>
              </div>
            )}

            <p className="text-sm text-gray-500 mt-4">
              Completed: {new Date(result.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-center text-gray-500">
          No test results available yet.
        </div>
      )}
    </div>
  );
}
