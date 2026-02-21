'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getMockTeacherSubmissions } from '@/lib/mockData';
import { isMockEnabled } from '@/lib/mockMode';

interface WritingSubmission {
  id: string;
  user_test_id: string;
  student_fullname: string;
  test_title: string;
  task: string;
  status: string;
  score?: number;
  submitted_at: string;
  checked_at?: string;
}

export default function TeacherCheckingPage() {
  const router = useRouter();
  const [allSubmissions, setAllSubmissions] = useState<WritingSubmission[]>([]);
  const [myChecking, setMyChecking] = useState<WritingSubmission[]>([]);
  const [myChecked, setMyChecked] = useState<WritingSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'checking' | 'checked'>('all');
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');

    if (!token || role !== 'teacher') {
      router.push('/login');
      return;
    }

    if (isMockEnabled()) {
      const mock = getMockTeacherSubmissions();
      setAllSubmissions(mock.all);
      setMyChecking(mock.checking);
      setMyChecked(mock.checked);
      setIsMock(true);
      setLoading(false);
      return;
    }

    fetchSubmissions();
  }, [router]);

  const fetchSubmissions = async () => {
    try {
      const [allRes, checkingRes, checkedRes] = await Promise.all([
        api.get('/teacher-checking/all/'),
        api.get('/teacher-checking/in-progress/'),
        api.get('/teacher-checking/checked/'),
      ]);

      if (
        Array.isArray(allRes.data) &&
        Array.isArray(checkingRes.data) &&
        Array.isArray(checkedRes.data) &&
        allRes.data.length === 0 &&
        checkingRes.data.length === 0 &&
        checkedRes.data.length === 0
      ) {
        const mock = getMockTeacherSubmissions();
        setAllSubmissions(mock.all);
        setMyChecking(mock.checking);
        setMyChecked(mock.checked);
        setIsMock(true);
        return;
      }

      setAllSubmissions(allRes.data);
      setMyChecking(checkingRes.data);
      setMyChecked(checkedRes.data);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      const mock = getMockTeacherSubmissions();
      setAllSubmissions(mock.all);
      setMyChecking(mock.checking);
      setMyChecked(mock.checked);
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (submissionId: string) => {
    if (isMock) {
      const found = allSubmissions.find((s) => s.id === submissionId);
      if (!found) return;
      setAllSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      setMyChecking((prev) => [
        { ...found, status: 'claimed' },
        ...prev,
      ]);
      alert('Demo mode: submission claimed.');
      return;
    }
    try {
      await api.post('/teacher-checking/claim/', { submission_id: submissionId });
      alert('Submission claimed successfully!');
      fetchSubmissions();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to claim submission');
    }
  };

  const handleGrade = async (submissionId: string) => {
    if (isMock) {
      const found = myChecking.find((s) => s.id === submissionId);
      if (!found) return;
      const scored = {
        ...found,
        status: 'checked',
        score: 7.5,
        checked_at: new Date().toISOString(),
      };
      setMyChecking((prev) => prev.filter((s) => s.id !== submissionId));
      setMyChecked((prev) => [scored, ...prev]);
      alert('Demo mode: submission graded.');
      return;
    }
    const score = prompt('Enter score (0-9):');
    const feedback = prompt('Enter feedback:');

    if (!score || !feedback) return;

    try {
      await api.post('/teacher-checking/grade/', {
        submission_id: submissionId,
        score: parseFloat(score),
        feedback,
      });
      alert('Submission graded successfully!');
      fetchSubmissions();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to grade submission');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const getCurrentList = () => {
    switch (activeTab) {
      case 'all':
        return allSubmissions;
      case 'checking':
        return myChecking;
      case 'checked':
        return myChecked;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {isMock && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-100 text-yellow-800 px-4 py-1 text-sm font-semibold">
          Demo data
        </div>
      )}
      <h1 className="text-3xl font-bold text-[var(--primary)] mb-6">
        Writing Submissions
      </h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-6 py-2 rounded font-semibold ${
            activeTab === 'all'
              ? 'bg-[var(--primary)] text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          All Submissions ({allSubmissions.length})
        </button>
        <button
          onClick={() => setActiveTab('checking')}
          className={`px-6 py-2 rounded font-semibold ${
            activeTab === 'checking'
              ? 'bg-[var(--primary)] text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          In Progress ({myChecking.length})
        </button>
        <button
          onClick={() => setActiveTab('checked')}
          className={`px-6 py-2 rounded font-semibold ${
            activeTab === 'checked'
              ? 'bg-[var(--primary)] text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Checked ({myChecked.length})
        </button>
      </div>

      <div className="space-y-4">
        {getCurrentList().map((submission) => (
          <div key={submission.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-[var(--primary)]">
                  {submission.test_title} - {submission.task}
                </h3>
                <p className="text-gray-600 mt-1">
                  Student: {submission.student_fullname}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Submitted: {new Date(submission.submitted_at).toLocaleString()}
                </p>
                {submission.score && (
                  <p className="text-sm font-semibold text-green-600 mt-1">
                    Score: {submission.score}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {submission.status === 'pending' && (
                  <button
                    onClick={() => handleClaim(submission.id)}
                    className="btn-primary"
                  >
                    Claim
                  </button>
                )}
                {submission.status === 'claimed' && (
                  <button
                    onClick={() => handleGrade(submission.id)}
                    className="btn-primary"
                  >
                    Grade
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {getCurrentList().length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No submissions in this category.
        </div>
      )}
    </div>
  );
}
