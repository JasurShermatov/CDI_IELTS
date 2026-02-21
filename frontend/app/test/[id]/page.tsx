'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { TestDetail, QuestionSet } from '@/lib/types';

export default function TestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;

  const [test, setTest] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'listening' | 'reading' | 'writing'>('listening');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchTest = async () => {
      try {
        const response = await api.get(`/tests/${testId}/`);
        setTest(response.data);
      } catch (error) {
        console.error('Failed to fetch test:', error);
        alert('Failed to load test');
        router.push('/my-tests');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [router, testId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading test...</div>
      </div>
    );
  }

  if (!test) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[var(--primary)] mb-6">
        {test.title}
      </h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveSection('listening')}
          className={`px-6 py-2 rounded font-semibold ${
            activeSection === 'listening'
              ? 'bg-[var(--primary)] text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Listening
        </button>
        <button
          onClick={() => setActiveSection('reading')}
          className={`px-6 py-2 rounded font-semibold ${
            activeSection === 'reading'
              ? 'bg-[var(--primary)] text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Reading
        </button>
        <button
          onClick={() => setActiveSection('writing')}
          className={`px-6 py-2 rounded font-semibold ${
            activeSection === 'writing'
              ? 'bg-[var(--primary)] text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Writing
        </button>
      </div>

      {activeSection === 'listening' && test.listening && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Listening Section</h2>
          {test.listening.sections.map((section, idx) => (
            <div key={section.id} className="mb-6">
              <h3 className="text-xl font-semibold mb-2">
                {section.name || `Section ${idx + 1}`}
              </h3>
              {section.mp3_file && (
                <audio controls className="w-full mb-4">
                  <source src={section.mp3_file} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
              <p className="text-gray-600">
                Questions: {section.question_set_ids.length} sets
              </p>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'reading' && test.reading && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Reading Section</h2>
          {test.reading.passages.map((passage, idx) => (
            <div key={passage.id} className="mb-6">
              <h3 className="text-xl font-semibold mb-2">
                {passage.name || `Passage ${idx + 1}`}
              </h3>
              <p className="text-gray-600">
                Questions: {passage.question_set_ids.length} sets
              </p>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'writing' && test.writing && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Writing Section</h2>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
              Task 1
            </h3>
            <p className="mb-3">{test.writing.task_one.topic}</p>
            {test.writing.task_one.image && (
              <img
                src={test.writing.task_one.image}
                alt={test.writing.task_one.image_title || 'Task 1 Image'}
                className="max-w-full h-auto rounded"
              />
            )}
            <textarea
              className="w-full mt-4 p-4 border border-gray-300 rounded focus:outline-none focus:border-[var(--primary)]"
              rows={10}
              placeholder="Write your response here (minimum 150 words)..."
            />
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">
              Task 2
            </h3>
            <p className="mb-3">{test.writing.task_two.topic}</p>
            <textarea
              className="w-full mt-4 p-4 border border-gray-300 rounded focus:outline-none focus:border-[var(--primary)]"
              rows={15}
              placeholder="Write your response here (minimum 250 words)..."
            />
          </div>

          <button className="btn-primary">
            Submit Writing Tasks
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
        <button className="btn-primary">
          Submit Test
        </button>
      </div>
    </div>
  );
}
