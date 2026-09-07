import type { SerializedSale } from "@/types";
import { formatCurrency } from "@/lib/currency";
import { formatDateTimeLong } from "@/lib/date";

interface InvoicePrintProps {
    sale: SerializedSale;
}

export function InvoicePrint({ sale }: InvoicePrintProps) {
    const currency = sale.items[0]?.currency ?? "CDF";
    const totalAmount = Number(sale.totalAmount);

    return (
        <div className="bg-white p-8 max-w-2xl mx-auto">
            {/* En-tête facture */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-purple-900">FACTURE</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        N° {sale.invoiceNumber || sale.id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600">{formatDateTimeLong(sale.soldAt)}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-600">Date d&apos;émission</p>
                    <p className="text-sm font-medium text-gray-900">{formatDateTimeLong(sale.soldAt)}</p>
                </div>
            </div>

            {/* Informations client */}
            <div className="mb-8">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">Facturé à</h2>
                <p className="text-base font-medium text-gray-900">{sale.customer?.name ?? "Client anonyme"}</p>
            </div>

            {/* Informations paiement */}
            <div className="mb-8">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">Mode de paiement</h2>
                <p className="text-base text-gray-900">{sale.paymentMethod}</p>
            </div>

            {/* Tableau des articles */}
            <div className="mb-8">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Articles</h2>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-2 text-gray-600 font-medium">Description</th>
                            <th className="text-right py-2 text-gray-600 font-medium">Qté</th>
                            <th className="text-right py-2 text-gray-600 font-medium">Prix unit.</th>
                            <th className="text-right py-2 text-gray-600 font-medium">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sale.items.map((item) => {
                            const unitPrice = Number(item.unitPrice);
                            const totalPrice = Number(item.totalPrice);
                            return (
                                <tr key={item.id} className="border-b border-gray-100">
                                    <td className="py-3 text-gray-900">{item.product.name}</td>
                                    <td className="py-3 text-right text-gray-600">{item.quantity}</td>
                                    <td className="py-3 text-right text-gray-600">{formatCurrency(unitPrice, item.currency)}</td>
                                    <td className="py-3 text-right font-medium text-gray-900">{formatCurrency(totalPrice, item.currency)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Totaux */}
            <div className="flex justify-end mb-8">
                <div className="w-64">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Total</span>
                        <span className="font-bold text-purple-700">{formatCurrency(totalAmount, currency)}</span>
                    </div>
                </div>
            </div>

            {/* Note */}
            {sale.note && (
                <div className="mb-8">
                    <h2 className="text-sm font-semibold text-gray-700 mb-2">Note</h2>
                    <p className="text-sm text-gray-700">{sale.note}</p>
                </div>
            )}

            {/* Pied de page */}
            <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
                <p>Merci pour votre confiance</p>
            </div>
        </div>
    );
}
