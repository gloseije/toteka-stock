"use client";

import { Filter } from "lucide-react";

interface FilterOption {
    value: string;
    label: string;
}

interface FilterSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
    placeholder?: string;
}

export function FilterSelect({ value, onChange, options, placeholder = "Filtrer" }: FilterSelectProps) {
    return (
        <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none rounded-md border border-gray-200 bg-white pl-9 pr-8 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
