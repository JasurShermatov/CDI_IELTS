'use client';

import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <span className="text-6xl mb-4">⚠️</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
            </h2>
            <p className="text-gray-500 max-w-md mb-6">
                An unexpected error occurred. Please try again or contact support if the
                problem persists.
            </p>
            <div className="flex gap-3">
                <button onClick={reset} className="btn-primary">
                    Try Again
                </button>
                <Link href="/" className="btn-secondary">
                    Go Home
                </Link>
            </div>
        </div>
    );
}
