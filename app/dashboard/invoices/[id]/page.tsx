import Link from "next/link";
import { ArrowLeft, Pencil, Download, Send, CheckCircle, XCircle, Printer } from "lucide-react";
import { notFound } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "CANCELLED";

interface InvoiceItem {
    id: string;
    productName: string;
    quantity: number;
    price: number;
}

interface Invoice {
    id: string;
    number: string;
    status: InvoiceStatus;
    customerName: string;
    customerEmail: string | null;
    customerPhone: string | null;
    customerAddress: string | null;
    items: InvoiceItem[];
    amount: number;
    dueDate: string;
    createdAt: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

async function getInvoice(id: string): Promise<Invoice | null> {
    // TODO: GET /api/invoices/:id
    return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function getStatusStyles(status: InvoiceStatus) {
    switch (status) {
        case "PAID":
            return "bg-green-50 text-green-700 border-green-100";
        case "SENT":
            return "bg-blue-50 text-blue-700 border-blue-100";
        case "DRAFT":
            return "bg-gray-50 text-gray-600 border-gray-100";
        case "CANCELLED":
            return "bg-red-50 text-red-700 border-red-100";
        default:
            return "bg-gray-50 text-gray-600 border-gray-100";
    }
}

function translateStatus(status: InvoiceStatus) {
    switch (status) {
        case "PAID":
            return "Payée";
        case "SENT":
            return "Envoyée";
        case "DRAFT":
            return "Brouillon";
        case "CANCELLED":
            return "Annulée";
        default:
            return status;
    }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
    const invoice = await getInvoice(params.id);

    // MOCK DATA pour le design si non trouvé (pour le développement)
    const mockInvoice: Invoice = {
        id: params.id,
        number: "FAC-2024-001",
        status: "DRAFT",
        customerName: "Jean Dupont",
        customerEmail: "jean.dupont@exemple.com",
        customerPhone: "+243 812 345 678",
        customerAddress: "123 Avenue de la Paix, Kinshasa",
        amount: 150000,
        dueDate: "2024-08-15",
        createdAt: "2024-07-15",
        items: [
            { id: "1", productName: "Produit A", quantity: 2, price: 50000 },
            { id: "2", productName: "Produit B", quantity: 1, price: 50000 },
        ],
    };

    const data = invoice || mockInvoice;

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl w-full mx-auto">
            {/* Nav & Actions */}
            <div className="flex items-center justify-between">
                <Link
                    href="/dashboard/invoices"
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Retour aux factures
                </Link>

                <div className="flex items-center gap-2">
                    {data.status === "DRAFT" && (
                        <Link
                            href={`/dashboard/invoices/${data.id}/edit`}
                            className="flex items-center gap-2 text-xs font-semibold border border-gray-200 text-gray-600 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                            Modifier
                        </Link>
                    )}
                    <button className="flex items-center gap-2 text-xs font-semibold border border-gray-200 text-gray-600 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">
                        <Printer className="w-3.5 h-3.5" />
                        Imprimer
                    </button>
                    <button className="flex items-center gap-2 text-xs font-semibold bg-purple-600 text-white px-4 py-1.5 rounded hover:bg-purple-700 transition-colors">
                        <Send className="w-3.5 h-3.5" />
                        Envoyer par email
                    </button>
                </div>
            </div>

            {/* Facture Container */}
            <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
                {/* Status Bar */}
                <div className="px-8 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        État de la facture
                    </span>
                    <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusStyles(data.status)}`}
                    >
                        {translateStatus(data.status).toUpperCase()}
                    </span>
                </div>

                <div className="p-12 flex flex-col gap-12">
                    {/* Header: Company & Client */}
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-bold text-purple-600 tracking-tight">
                                TOTEKA
                            </h2>
                            <p className="text-xs text-gray-400">Kinshasa, RD Congo</p>
                        </div>
                        <div className="text-right flex flex-col gap-1">
                            <h1 className="text-xl font-bold text-gray-900">
                                Facture {data.number}
                            </h1>
                            <p className="text-xs text-gray-500 italic">
                                Émise le {formatDate(data.createdAt)}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12">
                        <div className="flex flex-col gap-3">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Facturé à
                            </span>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-bold text-gray-900">
                                    {data.customerName}
                                </p>
                                <p className="text-xs text-gray-500">{data.customerAddress}</p>
                                <p className="text-xs text-gray-500">{data.customerPhone}</p>
                                <p className="text-xs text-gray-500">{data.customerEmail}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 text-right items-end">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Échéance
                            </span>
                            <p className="text-sm font-bold text-red-600">
                                {formatDate(data.dueDate)}
                            </p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex flex-col">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-900/5">
                                    <th className="text-left py-3 font-semibold text-gray-900">
                                        Description
                                    </th>
                                    <th className="text-right py-3 font-semibold text-gray-900 w-24">
                                        Quantité
                                    </th>
                                    <th className="text-right py-3 font-semibold text-gray-900 w-32">
                                        Prix unit.
                                    </th>
                                    <th className="text-right py-3 font-semibold text-gray-900 w-32">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-900/5">
                                {data.items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="py-4 text-gray-600">{item.productName}</td>
                                        <td className="py-4 text-right text-gray-600">
                                            {item.quantity}
                                        </td>
                                        <td className="py-4 text-right text-gray-600">
                                            {item.price.toLocaleString("fr-FR")} Fc
                                        </td>
                                        <td className="py-4 text-right font-medium text-gray-900">
                                            {(item.quantity * item.price).toLocaleString("fr-FR")}{" "}
                                            Fc
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="flex flex-col items-end gap-3 mt-8 pt-8 border-t border-gray-900/5">
                            <div className="flex items-center gap-12 text-sm text-gray-500">
                                <span>Sous-total</span>
                                <span className="font-medium text-gray-900 w-32 text-right">
                                    {data.amount.toLocaleString("fr-FR")} Fc
                                </span>
                            </div>
                            <div className="flex items-center gap-12 text-lg font-bold text-gray-900">
                                <span>Total</span>
                                <span className="text-purple-600 w-32 text-right">
                                    {data.amount.toLocaleString("fr-FR")} Fc
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Notes */}
                    <div className="mt-8 pt-8 border-t border-gray-50">
                        <p className="text-[10px] text-gray-400 leading-relaxed max-w-md">
                            Veuillez effectuer le paiement avant la date d'échéance. Pour toute
                            question concernant cette facture, merci de nous contacter.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Actions Footer (Statut management) */}
            <div className="bg-white border border-gray-200 rounded p-6 flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-bold text-gray-900">Changer le statut</p>
                    <p className="text-[10px] text-gray-500">
                        Mettez à jour l'état de cette facture manuellement.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {data.status !== "PAID" && (
                        <button className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded border border-green-100 hover:bg-green-100 transition-colors">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Marquer comme payée
                        </button>
                    )}
                    {data.status !== "CANCELLED" && (
                        <button className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded border border-red-100 hover:bg-red-100 transition-colors">
                            <XCircle className="w-3.5 h-3.5" />
                            Annuler la facture
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
