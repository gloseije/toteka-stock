"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { trackCustomerCreated } from "@/lib/analytics";

interface Customer {
    id: string;
    name: string;
}

interface CustomerChoiceProps {
    customers: Customer[];
    customerId: string;
    onCustomerIdChange: (customerId: string) => void;
    onCustomerCreated: (customer: Customer) => void;
    label?: string;
}

const inputClass =
    "w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-600 transition-colors bg-white";

export function CustomerChoice({
    customers,
    customerId,
    onCustomerIdChange,
    onCustomerCreated,
    label = "Client",
}: CustomerChoiceProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [saving, setSaving] = useState(false);

    const createCustomer = async () => {
        if (name.trim().length < 2) {
            toast.error("Le nom du client doit contenir au moins 2 caractères");
            return;
        }
        setSaving(true);
        try {
            const response = await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), phone: phone.trim() || null }),
            });
            if (!response.ok) {
                toast.error("Impossible de créer le client");
                setSaving(false);
                return;
            }
            const customer: Customer = await response.json();
            trackCustomerCreated();
            onCustomerCreated(customer);
            onCustomerIdChange(customer.id);
            setName("");
            setPhone("");
            setIsCreating(false);
            toast.success("Client créé");
        } catch {
            toast.error("Impossible de créer le client");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
                <label className="block text-xs font-semibold text-gray-700">{label}</label>
                <button
                    type="button"
                    onClick={() => setIsCreating((value) => !value)}
                    className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700"
                >
                    <Plus className="w-3.5 h-3.5" />
                    {isCreating ? "Choisir un client" : "Créer un client"}
                </button>
            </div>
            {isCreating ? (
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
                    <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Nom du client"
                        className={inputClass}
                    />
                    <input
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="Téléphone (optionnel)"
                        className={inputClass}
                    />
                    <button
                        type="button"
                        onClick={createCustomer}
                        disabled={saving}
                        className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded hover:bg-purple-700 disabled:opacity-50"
                    >
                        {saving ? "Création..." : "Créer"}
                    </button>
                </div>
            ) : (
                <select
                    value={customerId}
                    onChange={(event) => onCustomerIdChange(event.target.value)}
                    className={inputClass}
                >
                    <option value="">Client de passage</option>
                    {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                            {customer.name}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
}
