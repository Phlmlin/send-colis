export default function DashboardLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="h-32 bg-gray-200/50 rounded-3xl w-full"></div>

            {/* Content Grid Skeleton */}
            <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 bg-gray-200/50 rounded-2xl w-full"></div>
                ))}
            </div>

            {/* List Skeleton */}
            <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-gray-200/50 rounded-xl w-full"></div>
                ))}
            </div>
        </div>
    )
}
