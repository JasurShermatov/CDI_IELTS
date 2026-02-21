/* ─── Skeleton primitives ──────────────────────────── */

export function SkeletonLine({
    className = '',
    width = 'w-full',
}: {
    className?: string;
    width?: string;
}) {
    return (
        <div
            className={`h-4 rounded bg-gray-200 animate-pulse ${width} ${className}`}
        />
    );
}

export function SkeletonCircle({ size = 'w-12 h-12' }: { size?: string }) {
    return <div className={`rounded-full bg-gray-200 animate-pulse ${size}`} />;
}

export function SkeletonCard() {
    return (
        <div className="card animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-10 bg-gray-200 rounded w-full mt-4" />
        </div>
    );
}

export function SkeletonCardGrid({
    count = 6,
    cols = 'md:grid-cols-2 lg:grid-cols-3',
}: {
    count?: number;
    cols?: string;
}) {
    return (
        <div className={`grid gap-6 ${cols}`}>
            {Array.from({ length: count }, (_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

export function SkeletonDashboard() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
            <div className="grid md:grid-cols-2 gap-6">
                <div className="card">
                    <div className="h-5 bg-gray-200 rounded w-1/2 mb-4" />
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                </div>
                <div className="card">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
                    <div className="h-10 bg-gray-200 rounded w-2/3 mb-4" />
                    <div className="h-10 bg-gray-200 rounded w-1/3" />
                </div>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="card">
                        <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SkeletonTable({ rows = 4 }: { rows?: number }) {
    return (
        <div className="space-y-4 animate-pulse">
            {Array.from({ length: rows }, (_, i) => (
                <div key={i} className="card">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-1" />
                            <div className="h-3 bg-gray-200 rounded w-1/3" />
                        </div>
                        <div className="h-9 bg-gray-200 rounded w-20" />
                    </div>
                </div>
            ))}
        </div>
    );
}
