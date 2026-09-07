"use client";

interface CurrencyToggleProps {
    currency: "USD" | "FC";
    onChange: (currency: "USD" | "FC") => void;
}

export default function CurrencyToggle({ currency, onChange }: CurrencyToggleProps) {
    return (
        <div className="inline-flex rounded-md border border-gray-200 bg-white p-0.5 text-sm">
            {(["FC", "USD"] as const).map((c) => (
                <button
                    key={c}
                    type="button"
                    onClick={() => onChange(c)}
                    className={`px-3 py-1 rounded transition ${
                        currency === c
                            ? "bg-purple-50 font-semibold text-purple-700"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                >
                    {c}
                </button>
            ))}
        </div>
    );
}
