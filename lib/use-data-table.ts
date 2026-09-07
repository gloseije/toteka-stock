"use client";

import { useState, useMemo } from "react";

interface PaginationState {
    page: number;
    limit: number;
}

interface UseDataTableOptions<T> {
    data: T[];
    searchableFields?: Array<keyof T>;
    filterFn?: (item: T, filterValue: string) => boolean;
    sortFn?: (a: T, b: T, sortValue: string) => number;
    initialLimit?: number;
}

export function useDataTable<T>({
    data,
    searchableFields,
    filterFn,
    sortFn,
    initialLimit = 20,
}: UseDataTableOptions<T>) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("");
    const [sort, setSort] = useState("");
    const [pagination, setPagination] = useState<PaginationState>({
        page: 1,
        limit: initialLimit,
    });

    const filteredData = useMemo(() => {
        let result = [...data];

        if (search && searchableFields && searchableFields.length > 0) {
            const searchLower = search.toLowerCase();
            result = result.filter((item) =>
                searchableFields.some((field) => {
                    const value = item[field];
                    if (value === null || value === undefined) return false;
                    return String(value).toLowerCase().includes(searchLower);
                })
            );
        }

        if (filter && filterFn) {
            result = result.filter((item) => filterFn(item, filter));
        }

        if (sort && sortFn) {
            result = result.sort((a, b) => sortFn(a, b, sort));
        }

        return result;
    }, [data, search, filter, sort, searchableFields, filterFn, sortFn]);

    const total = filteredData.length;
    const pages = Math.ceil(total / pagination.limit);
    const page = Math.min(pagination.page, pages || 1);

    const paginatedData = useMemo(() => {
        const start = (page - 1) * pagination.limit;
        return filteredData.slice(start, start + pagination.limit);
    }, [filteredData, page, pagination.limit]);

    const setPage = (newPage: number) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    };

    const resetFilters = () => {
        setSearch("");
        setFilter("");
        setSort("");
        setPage(1);
    };

    return {
        search,
        setSearch,
        filter,
        setFilter,
        sort,
        setSort,
        page,
        setPage,
        limit: pagination.limit,
        total,
        pages,
        paginatedData,
        resetFilters,
    };
}
