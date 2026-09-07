"use client";

import { Filter } from "lucide-react";
import { Select, SelectOption } from "./select";

interface FilterSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
}

export function FilterSelect({ value, onChange, options, placeholder = "Filtrer" }: FilterSelectProps) {
    return (
        <Select
            value={value}
            onChange={onChange}
            options={options}
            icon={<Filter className="size-4" />}
            placeholder={placeholder}
        />
    );
}
