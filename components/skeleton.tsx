interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse rounded-md bg-gray-200 ${className ?? ""}`}
        />
    );
}

export function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={`rounded-lg border border-gray-200 bg-white p-4 space-y-3 ${className ?? ""}`}>
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-6 w-1/2" />
        </div>
    );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="space-y-2 p-4">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-3">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SkeletonListItem() {
    return (
        <div className="flex items-center justify-between gap-4 border-gray-100 px-4 py-3 sm:px-5 not-last:border-b">
            <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-16" />
        </div>
    );
}

export function SkeletonPage() {
    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
            <Skeleton className="h-4 w-48" />
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
            <SkeletonTable rows={6} />
        </div>
    );
}
