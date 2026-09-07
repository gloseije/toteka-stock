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

export function SkeletonTable({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50/80">
                        <tr>
                            {Array.from({ length: columns }).map((_, i) => (
                                <th key={i} className="px-5 py-3 text-left">
                                    <Skeleton className="h-3 w-16" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <tr key={rowIndex} className="whitespace-nowrap">
                                {Array.from({ length: columns }).map((_, colIndex) => (
                                    <td key={colIndex} className="px-5 py-3">
                                        <Skeleton className="h-3 w-20" />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function SkeletonProductCard() {
    return (
        <div className="flex flex-row items-start gap-4 rounded-lg border border-gray-200 bg-white p-4">
            <Skeleton className="h-20 w-20 shrink-0 rounded-md" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
                <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-20" />
            </div>
        </div>
    );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonProductCard key={i} />
            ))}
        </div>
    );
}

export function SkeletonProductDetail() {
    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
            <div className="flex gap-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-10 w-24 rounded-md" />
                    <Skeleton className="h-10 w-24 rounded-md" />
                    <Skeleton className="h-10 w-24 rounded-md" />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <div className="space-y-4 lg:col-span-2">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </div>
            <SkeletonTable rows={5} />
        </div>
    );
}


