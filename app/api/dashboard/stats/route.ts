import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";

function parseDate(value: string | null): Date | null {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function endOfDay(date: Date): Date {
    const end = new Date(date);
    end.setUTCDate(end.getUTCDate() + 1);
    return end;
}

export const GET = withAuth(async (request, { user }) => {
    const shop = await prisma.shop.findUnique({
        where: { userId: user.id },
        select: { id: true, currency: true },
    });
    if (!shop) return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });
    const { searchParams } = new URL(request.url);
    const from = parseDate(searchParams.get("from"));
    const to = parseDate(searchParams.get("to"));
    const groupBy = searchParams.get("groupBy") ?? "day";
    if (
        (searchParams.get("from") && !from) ||
        (searchParams.get("to") && !to) ||
        (from && to && from > to) ||
        !["day", "week", "month"].includes(groupBy)
    )
        return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
    const where = {
        shopId: shop.id,
        ...(from || to
            ? {
                  soldAt: {
                      ...(from ? { gte: from } : {}),
                      ...(to ? { lt: endOfDay(to) } : {}),
                  },
              }
            : {}),
    };
    const [aggregate, topProducts] = await Promise.all([
        prisma.sale.aggregate({ where, _sum: { totalAmount: true, profit: true }, _count: true }),
        prisma.saleItem.groupBy({
            by: ["productId"],
            where: { sale: where },
            _sum: { quantity: true, totalPrice: true },
            orderBy: { _sum: { totalPrice: "desc" } },
            take: 5,
        }),
    ]);
    const ids = topProducts.map((item) => item.productId);
    const products = await prisma.product.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true, currency: true },
    });
    const productInfo = new Map(products.map((product) => [product.id, product]));
    return NextResponse.json({
        revenue: Number(aggregate._sum.totalAmount ?? 0),
        profit: Number(aggregate._sum.profit ?? 0),
        salesCount: aggregate._count,
        groupBy,
        topProducts: topProducts.map((item) => ({
            productId: item.productId,
            name: productInfo.get(item.productId)?.name ?? "Produit supprimé",
            currency: shop.currency,
            quantity: item._sum.quantity ?? 0,
            revenue: Number(item._sum.totalPrice ?? 0),
        })),
        currencies: [
            {
                currency: shop.currency,
                revenue: Number(aggregate._sum.totalAmount ?? 0),
                profit: Number(aggregate._sum.profit ?? 0),
            },
        ],
    });
});
