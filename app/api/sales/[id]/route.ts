import { NextResponse } from "next/server";
import { PaymentMethod, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { updateSaleSchema } from "@/lib/validations";
import { z } from "zod";
import { calculateSaleTotals } from "@/lib/sales-utils";

async function getShop(userId: string) {
    return prisma.shop.findUnique({
        where: { userId },
        select: { id: true, currency: true, exchangeRate: true },
    });
}

export const GET = withAuth(async (_request, { user }, params: { id: string }) => {
    const shop = await getShop(user.id);
    if (!shop) return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });
    const shopId = shop.id;
    const sale = await prisma.sale.findFirst({
        where: { id: params.id, shopId },
        include: {
            customer: true,
            items: { include: { product: { select: { id: true, name: true } } } },
        },
    });
    return sale
        ? NextResponse.json(sale)
        : NextResponse.json({ error: "Vente introuvable" }, { status: 404 });
});

export const PATCH = withAuth(async (request, { user }, params: { id: string }) => {
    const shop = await getShop(user.id);
    if (!shop) return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });
    const shopId = shop.id;

    const existing = await prisma.sale.findFirst({
        where: { id: params.id, shopId },
        include: { items: true },
    });
    if (!existing) return NextResponse.json({ error: "Vente introuvable" }, { status: 404 });

    const parsed = updateSaleSchema.safeParse(await request.json());
    if (!parsed.success)
        return NextResponse.json(
            { error: "Données invalides", details: z.treeifyError(parsed.error) },
            { status: 400 }
        );
    if (parsed.data.customerId) {
        const customer = await prisma.customer.findFirst({
            where: { id: parsed.data.customerId, shopId },
            select: { id: true },
        });
        if (!customer) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
    }
    const data: Prisma.SaleUpdateInput = {
        ...(parsed.data.customerId !== undefined
            ? {
                  customer: parsed.data.customerId
                      ? { connect: { id: parsed.data.customerId } }
                      : { disconnect: true },
              }
            : {}),
        ...(parsed.data.paymentMethod
            ? { paymentMethod: parsed.data.paymentMethod as PaymentMethod }
            : {}),
        ...(parsed.data.note !== undefined ? { note: parsed.data.note } : {}),
        ...(parsed.data.soldAt ? { soldAt: parsed.data.soldAt } : {}),
    };
    const result = await prisma.$transaction(async (tx) => {
        if (!parsed.data.items) {
            const updated = await tx.sale.update({
                where: { id: params.id },
                data,
                include: { customer: true, items: { include: { product: true } } },
            });
            return { sale: updated };
        }
        const quantities = new Map<string, number>();
        for (const item of parsed.data.items)
            quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
        const products = await tx.product.findMany({
            where: { shopId, id: { in: [...quantities.keys()] } },
            select: {
                id: true,
                name: true,
                stock: true,
                sellingPrice: true,
                purchasePrice: true,
                currency: true,
            },
        });
        if (products.length !== quantities.size) return { error: "PRODUCT_NOT_FOUND" };
        const oldQuantities = new Map<string, number>();
        for (const item of existing.items)
            oldQuantities.set(
                item.productId,
                (oldQuantities.get(item.productId) ?? 0) + item.quantity
            );
        for (const product of products) {
            const available = product.stock + (oldQuantities.get(product.id) ?? 0);
            if (available < (quantities.get(product.id) ?? 0))
                return { error: "INSUFFICIENT_STOCK" };
        }

        const {
            totalAmount,
            totalCost,
            profit,
            items: saleItems,
        } = calculateSaleTotals(parsed.data.items, products, shop);

        for (const product of products)
            await tx.product.update({
                where: { id: product.id },
                data: { stock: { increment: oldQuantities.get(product.id) ?? 0 } },
            });
        for (const item of parsed.data.items)
            await tx.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
            });
        const updated = await tx.sale.update({
            where: { id: params.id },
            data: {
                ...data,
                totalAmount,
                totalCost,
                profit,
                items: {
                    deleteMany: {},
                    create: saleItems,
                },
            },
            include: { customer: true, items: { include: { product: true } } },
        });
        return { sale: updated };
    });

    if ("error" in result) {
        if (result.error === "PRODUCT_NOT_FOUND")
            return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
        if (result.error === "INSUFFICIENT_STOCK")
            return NextResponse.json({ error: "Stock insuffisant" }, { status: 400 });
        return NextResponse.json({ error: "Erreur inconnue" }, { status: 400 });
    }

    return NextResponse.json(result.sale);
});

export const DELETE = withAuth(async (_request, { user }, params: { id: string }) => {
    const shop = await getShop(user.id);
    if (!shop) return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });
    const shopId = shop.id;
    const sale = await prisma.sale.findFirst({
        where: { id: params.id, shopId },
        include: { items: true },
    });
    if (!sale) return NextResponse.json({ error: "Vente introuvable" }, { status: 404 });
    await prisma.$transaction(async (tx) => {
        for (const item of sale.items)
            await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
            });
        await tx.sale.delete({ where: { id: sale.id } });
    });
    return new NextResponse(null, { status: 204 });
});
