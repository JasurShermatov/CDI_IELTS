export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-48" />
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }, (_, i) => (
                        <div key={i} className="card">
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-4" />
                            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
                            <div className="h-10 bg-gray-200 rounded w-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
