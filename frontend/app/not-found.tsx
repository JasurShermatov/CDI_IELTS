import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <span className="text-7xl mb-4">🔍</span>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h2>
            <p className="text-gray-500 max-w-md mb-6">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <Link href="/" className="btn-primary">
                Back to Home
            </Link>
        </div>
    );
}
