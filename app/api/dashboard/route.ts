import { NextResponse } from "next/server";
import type { Currency } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";

function amountsByCurrency(
    items: Array<{ currency: Currency; totalPrice: { toString(): string } }>
): Array<{ currency: Currency; amount: number }> {
    const totals = new Map<Currency, number>();
    for (const item of items) {
        totals.set(item.currency, (totals.get(item.currency) ?? 0) + Number(item.totalPrice));
    }
    return Array.from(totals, ([currency, amount]) => ({ currency, amount }));
}

export const GET = withAuth(async (_request, { user }) => {
    const shop = await prisma.shop.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!shop) return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [
        salesToday,
        currencyTotals,
        lowStockProducts,
        customersCount,
        recentCustomers,
        recentSales,
    ] = await Promise.all([
        prisma.sale.count({ where: { shopId: shop.id, soldAt: { gte: start, lt: end } } }),
        prisma.saleItem.groupBy({
            by: ["currency"],
            where: { sale: { shopId: shop.id, soldAt: { gte: start, lt: end } } },
            _sum: { totalPrice: true },
        }),
        prisma.product.findMany({
            where: { shopId: shop.id, isArchived: false },
            select: { id: true, name: true, stock: true, lowStockAlert: true },
        }),
        prisma.customer.count({ where: { shopId: shop.id } }),
        prisma.customer.findMany({
            where: { shopId: shop.id },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: { id: true, name: true, createdAt: true },
        }),
        prisma.sale.findMany({
            where: { shopId: shop.id },
            orderBy: { soldAt: "desc" },
            take: 5,
            select: {
                id: true,
                soldAt: true,
                customer: { select: { name: true } },
                items: { select: { currency: true, totalPrice: true } },
            },
        }),
    ]);

    const lowStockAlerts = lowStockProducts
        .filter((product) => product.stock <= product.lowStockAlert)
        .slice(0, 5);

    return NextResponse.json({
        salesCount: salesToday,
        customersCount,
        lowStockAlerts,
        recentCustomers,
        recentSales: recentSales.map((sale) => ({
            id: sale.id,
            soldAt: sale.soldAt,
            customer: sale.customer,
            totals: amountsByCurrency(sale.items),
        })),
        currencies: currencyTotals.map((total) => ({
            currency: total.currency,
            amount: Number(total._sum.totalPrice ?? 0),
        })),
    });
});
