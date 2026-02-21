'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

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

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');

    if (!token || role !== 'teacher') {
      router.push('/login');
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

      setAllSubmissions(allRes.data);
      setMyChecking(checkingRes.data);
      setMyChecked(checkedRes.data);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (submissionId: string) => {
    try {
      await api.post('/teacher-checking/claim/', { submission_id: submissionId });
      alert('Submission claimed successfully!');
      fetchSubmissions();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to claim submission');
    }
  };

  const handleGrade = async (submissionId: string) => {
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
