import { NextResponse } from "next/server";
import { PaymentMethod, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withAuth, withActiveSubscription } from "@/lib/auth-guard";
import { saleSchema } from "@/lib/validations";
import { z } from "zod";
import { calculateSaleTotals } from "@/lib/sales-utils";

function toDate(value: string | null): Date | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

export const GET = withAuth(async (request, { user }) => {
    const shop = await prisma.shop.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!shop) return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(
        100,
        Math.max(1, Number.parseInt(searchParams.get("limit") ?? "20", 10) || 20)
    );
    let from = toDate(searchParams.get("from"));
    let to = toDate(searchParams.get("to"));
    const date = searchParams.get("date");
    const search = searchParams.get("search") || "";

    if (date && !from && !to) {
        const now = new Date();
        if (date === "Aujourd'hui") {
            from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        } else if (date === "Cette semaine") {
            const day = now.getDay() || 7;
            from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
            to = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 8);
        } else if (date === "Ce mois") {
            from = new Date(now.getFullYear(), now.getMonth(), 1);
            to = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        }
    }

    if ((searchParams.get("from") && !from) || (searchParams.get("to") && !to)) {
        return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }

    const where: Prisma.SaleWhereInput = {
        shopId: shop.id,
        ...(searchParams.get("customerId") ? { customerId: searchParams.get("customerId")! } : {}),
        ...(from || to
            ? { soldAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
            : {}),
    };

    if (search) {
        where.OR = [
            { invoiceNumber: { contains: search, mode: "insensitive" as const } },
            { customer: { name: { contains: search, mode: "insensitive" as const } } },
            { items: { some: { product: { name: { contains: search, mode: "insensitive" as const } } } } },
        ];
    }

    const sort = searchParams.get("sort") || "soldAt";
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";
    const orderBy: Prisma.SaleOrderByWithRelationInput =
        sort === "totalAmount"
            ? { totalAmount: order }
            : sort === "customer"
              ? { customer: { name: order } }
              : { soldAt: order };

    const [sales, total] = await Promise.all([
        prisma.sale.findMany({
            where,
            include: {
                customer: { select: { id: true, name: true } },
                items: { include: { product: { select: { id: true, name: true } } } },
            },
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.sale.count({ where }),
    ]);
    return NextResponse.json({
        sales,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
});

export const POST = withActiveSubscription(async (request, { user }) => {
    try {
        const shop = await prisma.shop.findUnique({
            where: { userId: user.id },
            select: { id: true, currency: true, exchangeRate: true },
        });
        if (!shop) return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });
        const parsed = saleSchema.safeParse(await request.json());
        if (!parsed.success)
            return NextResponse.json(
                { error: "Données invalides", details: z.treeifyError(parsed.error) },
                { status: 400 }
            );

        const result = await prisma.$transaction(async (tx) => {
            if (parsed.data.customerId) {
                const customer = await tx.customer.findFirst({
                    where: { id: parsed.data.customerId, shopId: shop.id },
                    select: { id: true },
                });
                if (!customer) return { error: "CLIENT_NOT_FOUND" };
            }
            const quantities = new Map<string, number>();
            for (const item of parsed.data.items)
                quantities.set(
                    item.productId,
                    (quantities.get(item.productId) ?? 0) + item.quantity
                );
            const products = await tx.product.findMany({
                where: { shopId: shop.id, id: { in: [...quantities.keys()] } },
                select: {
                    id: true,
                    name: true,
                    stock: true,
                    purchasePrice: true,
                    sellingPrice: true,
                    currency: true,
                },
            });
            if (products.length !== quantities.size) return { error: "PRODUCT_NOT_FOUND" };
            const productsById = new Map(products.map((product) => [product.id, product]));
            for (const [productId, quantity] of quantities) {
                const product = productsById.get(productId);
                if (!product || product.stock < quantity) return { error: "INSUFFICIENT_STOCK" };
            }

            const {
                totalAmount,
                totalCost,
                profit,
                items: saleItems,
            } = calculateSaleTotals(parsed.data.items, products, shop);

            const invoiceNumber = `INV-${Math.random().toString(36).toUpperCase().substring(2, 8)}`;

            const sale = await tx.sale.create({
                data: {
                    shopId: shop.id,
                    customerId: parsed.data.customerId,
                    invoiceNumber,
                    paymentMethod: parsed.data.paymentMethod as PaymentMethod,
                    soldAt: parsed.data.soldAt,
                    note: parsed.data.note,
                    totalAmount,
                    totalCost,
                    profit,
                    items: {
                        create: saleItems,
                    },
                },
                include: { customer: true, items: { include: { product: true } } },
            });
            for (const [productId, quantity] of quantities)
                await tx.product.update({
                    where: { id: productId },
                    data: { stock: { decrement: quantity } },
                });
            return { sale };
        });

        if ("error" in result) {
            if (result.error === "CLIENT_NOT_FOUND")
                return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
            if (result.error === "PRODUCT_NOT_FOUND")
                return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
            if (result.error === "INSUFFICIENT_STOCK")
                return NextResponse.json({ error: "Stock insuffisant" }, { status: 400 });
            return NextResponse.json({ error: "Erreur inconnue" }, { status: 400 });
        }

        return NextResponse.json(result.sale, { status: 201 });
    } catch (error: unknown) {
        console.error("POST /api/sales error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
});
