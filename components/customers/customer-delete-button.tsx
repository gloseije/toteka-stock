"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface CustomerDeleteButtonProps {
    customerId: string;
}

export function CustomerDeleteButton({ customerId }: CustomerDeleteButtonProps) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Voulez-vous vraiment supprimer ce client ? Cette action est irréversible."))
            return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/customers/${customerId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                router.push("/dashboard/customers");
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || "Erreur lors de la suppression");
            }
        } catch (error) {
            console.error("Delete customer error:", error);
            alert("Erreur serveur");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
        >
            <Trash2 className="size-4" />
            Supprimer
        </button>
    );
}
