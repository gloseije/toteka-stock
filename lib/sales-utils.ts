import { Currency, PaymentMethod, Prisma } from "@prisma/client";
import { convertToShopCurrency, roundCurrency } from "./currency";

export interface SaleItemInput {
    productId: string;
    quantity: number;
    unitPrice: number;
}

export interface ProductData {
    id: string;
    name: string;
    stock: number;
    sellingPrice: number | Prisma.Decimal;
    purchasePrice: number | Prisma.Decimal | null;
    currency: Currency;
}

export interface ShopData {
    currency: Currency;
    exchangeRate: number | Prisma.Decimal;
}

export function calculateSaleTotals(
    items: SaleItemInput[],
    products: ProductData[],
    shop: ShopData
) {
    const productsById = new Map(products.map((p) => [p.id, p]));

    const costs = new Map(
        products.map((product) => [
            product.id,
            product.purchasePrice === null
                ? null
                : convertToShopCurrency(
                      Number(product.purchasePrice),
                      product.currency,
                      shop.currency,
                      Number(shop.exchangeRate)
                  ),
        ])
    );

    const saleItems = items.map((item) => {
        const product = productsById.get(item.productId);
        // Le prix unitaire saisi lors de la vente est dans la devise de la boutique
        const unitPrice = roundCurrency(item.unitPrice, shop.currency);
        const unitCost = costs.get(item.productId);

        return {
            productId: item.productId,
            label: product?.name ?? "Produit inconnu",
            quantity: item.quantity,
            currency: shop.currency,
            unitPrice,
            totalPrice: roundCurrency(item.quantity * unitPrice, shop.currency),
            unitCost,
            totalCost:
                unitCost === null || unitCost === undefined
                    ? null
                    : roundCurrency(unitCost * item.quantity, shop.currency),
        };
    });

    const totalAmount = roundCurrency(
        saleItems.reduce((sum, item) => sum + item.totalPrice, 0),
        shop.currency
    );

    const totalCost = roundCurrency(
        saleItems.reduce((sum, item) => sum + (item.totalCost ?? 0), 0),
        shop.currency
    );

    return {
        totalAmount,
        totalCost,
        profit: totalAmount - totalCost,
        items: saleItems,
    };
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    CASH: "Espèces",
    MOBILE_MONEY: "Mobile money",
    BANK_TRANSFER: "Virement bancaire",
    OTHER: "Autre",
};

export function paymentMethodLabel(method: string): string {
    return PAYMENT_METHOD_LABELS[method as PaymentMethod] ?? method;
}