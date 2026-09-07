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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <SearchInput
                value={search}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
            />
            <div className="flex items-center gap-2">
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
                {children}
            </div>
        </div>
    );
}
