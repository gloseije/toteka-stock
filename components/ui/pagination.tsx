"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PaginationProps {
    page: number;
    pages: number;
    total: number;
    limit: number;
    buildHref: (page: number) => string;
}

export function Pagination({ page, pages, total, limit, buildHref }: PaginationProps) {
    if (pages <= 1) return null;

    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">
                Affichage {start} - {end} sur {total}
            </p>
            <div className="flex items-center gap-1">
                <Link
                    href={buildHref(page - 1)}
                    aria-disabled={page <= 1}
                    className={`inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium transition ${
                        page <= 1
                            ? "pointer-events-none opacity-50 text-gray-400"
                            : "text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                >
                    <ChevronLeft className="size-4" />
                </Link>
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <Link
                        key={p}
                        href={buildHref(p)}
                        className={`inline-flex items-center justify-center min-w-10 rounded-md px-3 py-2 text-sm font-medium transition ${
                            p === page
                                ? "bg-purple-600 text-white border border-purple-600"
                                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                    >
                        {p}
                    </Link>
                ))}
                <Link
                    href={buildHref(page + 1)}
                    aria-disabled={page >= pages}
                    className={`inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium transition ${
                        page >= pages
                            ? "pointer-events-none opacity-50 text-gray-400"
                            : "text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                >
                    <ChevronRight className="size-4" />
                </Link>
            </div>
        </div>
    );
}
