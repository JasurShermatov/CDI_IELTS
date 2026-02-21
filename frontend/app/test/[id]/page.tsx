'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { TestDetail } from '@/lib/types';
import { getMockTestDetail } from '@/lib/mockData';
import { isMockEnabled } from '@/lib/mockMode';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { SkeletonDashboard } from '@/components/Skeleton';

type Section = 'listening' | 'reading' | 'writing';

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function TestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const toast = useToast();

  const [test, setTest] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<Section>('listening');
  const [isMock, setIsMock] = useState(false);
  const [task1Answer, setTask1Answer] = useState('');
  const [task2Answer, setTask2Answer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    if (isMockEnabled()) {
      setTest(getMockTestDetail(testId));
      setIsMock(true);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchTest = async () => {
      try {
        const response = await api.get(`/tests/${testId}/`, {
          signal: controller.signal,
        });
        setTest(response.data);
      } catch (err: any) {
        if (err.name === 'CanceledError') return;
        setError('Failed to load test.');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
    return () => controller.abort();
  }, [authLoading, isAuthenticated, testId]);

  const handleSubmitWriting = useCallback(async () => {
    if (isMock) {
      toast.success('Demo: writing submitted.');
      return;
    }

    if (wordCount(task1Answer) < 50 || wordCount(task2Answer) < 50) {
      toast.warning('Please write at least 50 words for each task before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/teacher-checking/submit/', {
        user_test_id: testId,
        task_1_answer: task1Answer,
        task_2_answer: task2Answer,
      });
      toast.success('Writing tasks submitted for checking!');
      router.push('/my-tests');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to submit writing.');
    } finally {
      setSubmitting(false);
    }
  }, [isMock, task1Answer, task2Answer, testId, toast, router]);

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

  if (!test) return null;

  const sections: { key: Section; label: string; icon: string }[] = [
    { key: 'listening', label: 'Listening', icon: '🎧' },
    { key: 'reading', label: 'Reading', icon: '📖' },
    { key: 'writing', label: 'Writing', icon: '✍️' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {isMock && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-100 text-yellow-800 px-4 py-1 text-sm font-semibold">
          ⚡ Demo data
        </div>
      )}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{test.title}</h1>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`tab-btn whitespace-nowrap ${activeSection === s.key ? 'tab-btn-active' : 'tab-btn-inactive'
              }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Listening */}
      {activeSection === 'listening' && test.listening && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-5">Listening Section</h2>
          <div className="space-y-6">
            {test.listening.sections.map((section, idx) => (
              <div key={section.id} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                <h3 className="text-lg font-semibold mb-2">
                  {section.name || `Section ${idx + 1}`}
                </h3>
                {section.mp3_file && (
                  <audio controls className="w-full mb-2">
                    <source src={section.mp3_file} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
                <p className="text-sm text-gray-500">
                  {section.question_set_ids.length} question set{section.question_set_ids.length > 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reading */}
      {activeSection === 'reading' && test.reading && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-5">Reading Section</h2>
          <div className="space-y-6">
            {test.reading.passages.map((passage, idx) => (
              <div key={passage.id} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                <h3 className="text-lg font-semibold mb-2">
                  {passage.name || `Passage ${idx + 1}`}
                </h3>
                <p className="text-sm text-gray-500">
                  {passage.question_set_ids.length} question set{passage.question_set_ids.length > 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Writing */}
      {activeSection === 'writing' && test.writing && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-5">Writing Section</h2>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 text-[var(--primary)]">
              Task 1
            </h3>
            <p className="mb-3 text-gray-700 leading-relaxed">{test.writing.task_one.topic}</p>
            {test.writing.task_one.image && (
              <img
                src={test.writing.task_one.image}
                alt={test.writing.task_one.image_title || 'Task 1 Image'}
                className="max-w-full h-auto rounded-lg border mb-4"
              />
            )}
            <textarea
              value={task1Answer}
              onChange={(e) => setTask1Answer(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg resize-none"
              rows={10}
              placeholder="Write your response here (minimum 150 words)..."
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {wordCount(task1Answer)} words
              {wordCount(task1Answer) < 150 && wordCount(task1Answer) > 0 && (
                <span className="text-amber-500 ml-2">
                  ({150 - wordCount(task1Answer)} more needed)
                </span>
              )}
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 text-[var(--primary)]">
              Task 2
            </h3>
            <p className="mb-3 text-gray-700 leading-relaxed">{test.writing.task_two.topic}</p>
            <textarea
              value={task2Answer}
              onChange={(e) => setTask2Answer(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg resize-none"
              rows={15}
              placeholder="Write your response here (minimum 250 words)..."
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {wordCount(task2Answer)} words
              {wordCount(task2Answer) < 250 && wordCount(task2Answer) > 0 && (
                <span className="text-amber-500 ml-2">
                  ({250 - wordCount(task2Answer)} more needed)
                </span>
              )}
            </p>
          </div>

          <button
            onClick={handleSubmitWriting}
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? 'Submitting...' : 'Submit Writing Tasks'}
          </button>
        </div>
      )}

      <div className="mt-8 flex gap-4">
        <button
          onClick={() => router.push('/my-tests')}
          className="btn-secondary"
        >
          Back to My Tests
        </button>
      </div>
    </div>
  );
}
