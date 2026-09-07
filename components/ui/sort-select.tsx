"use client";

import { ArrowUpDown } from "lucide-react";
import { Select, SelectOption } from "./select";

interface SortSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
}

export function SortSelect({ value, onChange, options }: SortSelectProps) {
    return (
        <Select
            value={value}
            onChange={onChange}
            options={options}
            icon={<ArrowUpDown className="size-4" />}
            emptyLabel="Trier"
        />
    );
}
