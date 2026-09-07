"use client";

import { SearchInput } from "./search-input";
import { SortSelect } from "./sort-select";
import { FilterSelect } from "./filter-select";

interface SortOption {
    value: string;
    label: string;
}

interface FilterOption {
    value: string;
    label: string;
}

interface DataToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    sort?: string;
    onSortChange?: (value: string) => void;
    sortOptions?: SortOption[];
    filter?: string;
    onFilterChange?: (value: string) => void;
    filterOptions?: FilterOption[];
    filterPlaceholder?: string;
    children?: React.ReactNode;
}

export function DataToolbar({
    search,
    onSearchChange,
    searchPlaceholder,
    sort,
    onSortChange,
    sortOptions,
    filter,
    onFilterChange,
    filterOptions,
    filterPlaceholder,
    children,
}: DataToolbarProps) {
    return (
        <div className="flex flex-col md:flex-row gap-3">
            <div className="flex w-full flex-row flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                    <SearchInput
                        value={search}
                        onChange={onSearchChange}
                        placeholder={searchPlaceholder}
                    />
                </div>
                <div className="flex flex-row flex-wrap items-center gap-2">
                    {filterOptions && onFilterChange && (
                        <FilterSelect
                            value={filter ?? ""}
                            onChange={onFilterChange}
                            options={filterOptions}
                            placeholder={filterPlaceholder}
                        />
                    )}
                    {sortOptions && onSortChange && (
                        <SortSelect
                            value={sort ?? ""}
                            onChange={onSortChange}
                            options={sortOptions}
                        />
                    )}
                </div>
            </div>
            <div className="flex-1 flex">
                {children}
            </div>
        </div>
    );
}
