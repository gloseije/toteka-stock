"use client";

import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, X } from "lucide-react";
import type { SerializedSale } from "@/types";
import { InvoicePrint } from "./invoice-print";

interface InvoicePrintButtonProps {
    sale: SerializedSale;
}

export function InvoicePrintButton({ sale }: InvoicePrintButtonProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handlePrint = useReactToPrint({
        contentRef,
        documentTitle: `Facture-${sale.invoiceNumber || sale.id.slice(-6).toUpperCase()}`,
        onAfterPrint: () => {
            setIsModalOpen(false);
        },
    });

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setTimeout(() => {
            handlePrint();
        }, 100);
    };

    return (
        <>
            <button
                onClick={handleOpenModal}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:border-gray-300"
            >
                <Printer className="size-4" />
                Imprimer
            </button>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Aperçu de la facture</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-md transition"
                            >
                                <X className="size-5" />
                            </button>
                        </div>
                        <div ref={contentRef}>
                            <InvoicePrint sale={sale} />
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handlePrint}
                                className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition"
                            >
                                Imprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
