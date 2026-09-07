import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, withActiveSubscription } from "@/lib/auth-guard";
import { createProductSchema } from "@/lib/validations";
import { z } from "zod";
import { getPublicUrl } from "@/lib/storage-actions";
import { roundCurrency } from "@/lib/currency";
import { Prisma } from "@prisma/client";

export const GET = withAuth(async (request, { user }) => {
    try {
        const shop = await prisma.shop.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });

        if (!shop) {
            return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);

        // Pagination
        const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(
            100,
            Math.max(1, Number.parseInt(searchParams.get("limit") || "50", 10))
        );
        const skip = (page - 1) * limit;

        // Search
        const search = searchParams.get("search") || "";

        // Filters
        const categoryId = searchParams.get("categoryId");
        const archived = searchParams.get("archived");
        const lowStock = searchParams.get("lowStock");

        // Sort
        const sort = searchParams.get("sort") || "createdAt";
        const order = searchParams.get("order") === "asc" ? "asc" : "desc";

        const where: Prisma.ProductWhereInput = {
            shopId: shop.id,
            ...(search
                ? {
                      name: { contains: search, mode: "insensitive" as const },
                  }
                : {}),
        };

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (archived !== null && archived !== "") {
            where.isArchived = archived === "true";
        } else {
            // Default to not archived if not specified
            where.isArchived = false;
        }

        if (lowStock === "true") {
            where.stock = {
                lte: prisma.product.fields.lowStockAlert,
            };
        }

        const orderBy: Prisma.ProductOrderByWithRelationInput =
            sort === "stock" || sort === "sellingPrice" || sort === "name"
                ? { [sort]: order }
                : { createdAt: order };

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    category: { select: { id: true, name: true } },
                    images: { select: { key: true, url: true } },
                    _count: {
                        select: { saleItems: true },
                    },
                },
            }),
            prisma.product.count({ where }),
        ]);

        const productsWithUrls = products.map((product) => ({
            ...product,
            images: product.images?.map((img) => ({
                ...img,
                url: getPublicUrl(img.key),
            })),
        }));

        return NextResponse.json({
            products: productsWithUrls,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET /api/products error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
});

export const POST = withActiveSubscription(async (request, { user }) => {
    try {
        const shop = await prisma.shop.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });

        if (!shop) {
            return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });
        }

        const body = await request.json();
        console.log("POST /api/products body:", body);
        const parsed = createProductSchema.safeParse(body);
        console.log("POST /api/products parsed:", parsed);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Données invalides", details: z.treeifyError(parsed.error) },
                { status: 400 }
            );
        }

        const { imageUrl, imageKey, ...productData } = parsed.data;
        productData.sellingPrice = roundCurrency(productData.sellingPrice, productData.currency);
        if (productData.purchasePrice !== null && productData.purchasePrice !== undefined)
            productData.purchasePrice = roundCurrency(
                productData.purchasePrice,
                productData.currency
            );
        const product = await prisma.product.create({
            data: {
                shopId: shop.id,
                ...productData,
                images:
                    imageUrl && imageKey
                        ? {
                              create: {
                                  url: imageUrl,
                                  key: imageKey,
                              },
                          }
                        : undefined,
            },
            include: {
                images: true,
            },
        });

        const productWithUrl = {
            ...product,
            images: product.images?.map((img) => ({
                ...img,
                url: getPublicUrl(img.key),
            })),
        };

        return NextResponse.json({ product: productWithUrl }, { status: 201 });
    } catch (error) {
        console.error("POST /api/products error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
});
