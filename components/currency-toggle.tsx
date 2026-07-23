"use client";

import { useState } from "react";

type Currency = "USD" | "FC";

interface CurrencyToggleProps {
    currency: Currency;
    onChange: (currency: Currency) => void;
}

export default function CurrencyToggle({ currency, onChange }: CurrencyToggleProps) {
    return (
        <div className="flex items-center justify-center gap-3 mb-10">
            <span className={`text-sm font-medium ${currency === "USD" ? "text-purple-600" : "text-gray-500"}`}>
                USD ($)
            </span>
            <button
                onClick={() => onChange(currency === "USD" ? "FC" : "USD")}
                className="relative w-12 h-6 bg-purple-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
                aria-label="Changer de devise"
            >
                <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-purple-600 rounded-full transition-transform ${
                        currency === "FC" ? "translate-x-6" : "translate-x-0"
                    }`}
                />
            </button>
            <span className={`text-sm font-medium ${currency === "FC" ? "text-purple-600" : "text-gray-500"}`}>
                FC (Franc congolais)
            </span>
        </div>
    );
}
