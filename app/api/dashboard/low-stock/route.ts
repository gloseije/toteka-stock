import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";

export const GET = withAuth(async (_request, { user }) => {
    const shop = await prisma.shop.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!shop) return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });
    const products = await prisma.product.findMany({
        where: { shopId: shop.id, isArchived: false },
        select: { id: true, name: true, stock: true, lowStockAlert: true, sellingPrice: true },
        orderBy: { stock: "asc" },
    });
    return NextResponse.json({
        products: products.filter((product) => product.stock <= product.lowStockAlert),
    });
});
