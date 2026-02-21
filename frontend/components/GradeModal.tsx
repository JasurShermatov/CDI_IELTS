'use client';

import { useState, useEffect, useRef } from 'react';

interface GradeModalProps {
    open: boolean;
    studentName: string;
    testTitle: string;
    task: string;
    loading?: boolean;
    onSubmit: (score: number, feedback: string) => void;
    onCancel: () => void;
}

export default function GradeModal({
    open,
    studentName,
    testTitle,
    task,
    loading = false,
    onSubmit,
    onCancel,
}: GradeModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [score, setScore] = useState('7.0');
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) {
            dialog.showModal();
            setScore('7.0');
            setFeedback('');
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numScore = parseFloat(score);
        if (isNaN(numScore) || numScore < 0 || numScore > 9) return;
        if (!feedback.trim()) return;
        onSubmit(numScore, feedback.trim());
    };

    if (!open) return null;

    return (
        <dialog
            ref={dialogRef}
            className="fixed inset-0 z-[100] bg-transparent p-0 m-0 max-w-none max-h-none w-full h-full"
            onClick={(e) => {
                if (e.target === dialogRef.current) onCancel();
            }}
        >
            <div className="flex items-center justify-center min-h-full p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-fade-in">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                        Grade Submission
                    </h3>
                    <p className="text-sm text-gray-500 mb-5">
                        {studentName} · {testTitle} · {task.replace('_', ' ').toUpperCase()}
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2 text-sm">
                                Score (0 – 9)
                            </label>
                            <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="9"
                                value={score}
                                onChange={(e) => setScore(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                                required
                            />
                        </div>

                        <div className="mb-5">
                            <label className="block text-gray-700 font-semibold mb-2 text-sm">
                                Feedback
                            </label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows={4}
                                placeholder="Provide detailed feedback for the student..."
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] resize-none"
                                required
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={loading}
                                className="px-5 py-2.5 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !feedback.trim()}
                                className="btn-primary text-sm disabled:opacity-50"
                            >
                                {loading ? 'Submitting...' : 'Submit Grade'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </dialog>
    );
}
