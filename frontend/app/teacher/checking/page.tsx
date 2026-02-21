'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { getMockTeacherSubmissions } from '@/lib/mockData';
import { isMockEnabled } from '@/lib/mockMode';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { SkeletonTable } from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import GradeModal from '@/components/GradeModal';

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

type Tab = 'all' | 'checking' | 'checked';

export default function TeacherCheckingPage() {
  const { isAuthenticated, isLoading: authLoading, role } = useAuth();
  const toast = useToast();
  const [allSubmissions, setAllSubmissions] = useState<WritingSubmission[]>([]);
  const [myChecking, setMyChecking] = useState<WritingSubmission[]>([]);
  const [myChecked, setMyChecked] = useState<WritingSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMock, setIsMock] = useState(false);

  // Grade modal state
  const [gradeTarget, setGradeTarget] = useState<WritingSubmission | null>(null);
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    if (authLoading || !isAuthenticated || role !== 'teacher') return;

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
  }, [authLoading, isAuthenticated, role]);

  const fetchSubmissions = async () => {
    try {
      const [allRes, checkingRes, checkedRes] = await Promise.all([
        api.get('/teacher-checking/all/'),
        api.get('/teacher-checking/in-progress/'),
        api.get('/teacher-checking/checked/'),
      ]);

      setAllSubmissions(Array.isArray(allRes.data) ? allRes.data : []);
      setMyChecking(Array.isArray(checkingRes.data) ? checkingRes.data : []);
      setMyChecked(Array.isArray(checkedRes.data) ? checkedRes.data : []);
    } catch (err: any) {
      setError('Failed to load submissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = useCallback(async (submissionId: string) => {
    if (isMock) {
      const found = allSubmissions.find((s) => s.id === submissionId);
      if (!found) return;
      setAllSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      setMyChecking((prev) => [{ ...found, status: 'claimed' }, ...prev]);
      toast.success('Demo: submission claimed.');
      return;
    }
    try {
      await api.post('/teacher-checking/claim/', { submission_id: submissionId });
      toast.success('Submission claimed!');
      fetchSubmissions();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to claim submission');
    }
  }, [isMock, allSubmissions, toast]);

  const handleGrade = useCallback(async (score: number, feedback: string) => {
    if (!gradeTarget) return;

    if (isMock) {
      const scored = {
        ...gradeTarget,
        status: 'checked',
        score,
        checked_at: new Date().toISOString(),
      };
      setMyChecking((prev) => prev.filter((s) => s.id !== gradeTarget.id));
      setMyChecked((prev) => [scored, ...prev]);
      setGradeTarget(null);
      toast.success('Demo: submission graded.');
      return;
    }

    setGrading(true);
    try {
      await api.post('/teacher-checking/grade/', {
        submission_id: gradeTarget.id,
        score,
        feedback,
      });
      toast.success('Submission graded!');
      setGradeTarget(null);
      fetchSubmissions();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to grade submission');
    } finally {
      setGrading(false);
    }
  }, [gradeTarget, isMock, toast]);

  const getCurrentList = (): WritingSubmission[] => {
    switch (activeTab) {
      case 'all':
        return allSubmissions;
      case 'checking':
        return myChecking;
      case 'checked':
        return myChecked;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 bg-gray-200 rounded w-56 mb-6 animate-pulse" />
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

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'All Submissions', count: allSubmissions.length },
    { key: 'checking', label: 'In Progress', count: myChecking.length },
    { key: 'checked', label: 'Checked', count: myChecked.length },
  ];

  const currentList = getCurrentList();

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {isMock && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-100 text-yellow-800 px-4 py-1 text-sm font-semibold">
          ⚡ Demo data
        </div>
      )}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Writing Submissions
      </h1>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`tab-btn whitespace-nowrap ${activeTab === tab.key ? 'tab-btn-active' : 'tab-btn-inactive'
              }`}
          >
            {tab.label}
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white/20' : 'bg-gray-300/50'
              }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {currentList.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No submissions"
          description="No submissions in this category yet."
        />
      ) : (
        <div className="space-y-3">
          {currentList.map((submission) => (
            <div key={submission.id} className="card py-5">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900">
                    {submission.test_title}{' '}
                    <span className="badge badge-neutral text-xs ml-2">
                      {submission.task.replace('_', ' ').toUpperCase()}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Student: {submission.student_fullname}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Submitted {new Date(submission.submitted_at).toLocaleString()}
                  </p>
                  {submission.score !== undefined && submission.score !== null && (
                    <p className="text-sm font-semibold text-emerald-600 mt-1">
                      Score: {submission.score}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  {submission.status === 'pending' && (
                    <button
                      onClick={() => handleClaim(submission.id)}
                      className="btn-primary text-sm py-2 px-4"
                    >
                      Claim
                    </button>
                  )}
                  {submission.status === 'claimed' && (
                    <button
                      onClick={() => setGradeTarget(submission)}
                      className="btn-primary text-sm py-2 px-4"
                    >
                      Grade
                    </button>
                  )}
                  {submission.status === 'checked' && (
                    <span className="badge badge-success">Graded</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grade modal */}
      <GradeModal
        open={!!gradeTarget}
        studentName={gradeTarget?.student_fullname ?? ''}
        testTitle={gradeTarget?.test_title ?? ''}
        task={gradeTarget?.task ?? ''}
        loading={grading}
        onSubmit={handleGrade}
        onCancel={() => setGradeTarget(null)}
      />
    </div>
  );
}
