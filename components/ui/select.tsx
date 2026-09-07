"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    icon: React.ReactNode;
    placeholder?: string;
    emptyLabel?: string;
}

export function Select({ value, onChange, options, icon, placeholder, emptyLabel }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    const selectedLabel = options.find((option) => option.value === value)?.label ?? placeholder ?? emptyLabel ?? "";
    const hasEmptyOption = options.some((option) => option.value === "");

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white text-sm text-gray-900 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 lg:w-auto lg:justify-start lg:gap-2 lg:px-3"
            >
                <span className="text-gray-400" aria-hidden="true">{icon}</span>
                <span className="hidden lg:inline">{selectedLabel}</span>
                <ChevronDown className="hidden lg:block size-4 text-gray-400" aria-hidden="true" />
            </button>
            {isOpen && (
                <div className="absolute right-0 z-10 mt-1 w-56 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                    <ul role="listbox" className="max-h-60 overflow-auto">
                        {placeholder !== undefined && !hasEmptyOption && (
                            <li>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={value === ""}
                                    onClick={() => {
                                        onChange("");
                                        setIsOpen(false);
                                    }}
                                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-purple-50 hover:text-purple-900"
                                >
                                    {placeholder}
                                    {value === "" && <Check className="size-4 text-purple-600" aria-hidden="true" />}
                                </button>
                            </li>
                        )}
                        {options.map((option) => (
                            <li key={option.value}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={value === option.value}
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-purple-50 hover:text-purple-900"
                                >
                                    {option.label}
                                    {value === option.value && <Check className="size-4 text-purple-600" aria-hidden="true" />}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
