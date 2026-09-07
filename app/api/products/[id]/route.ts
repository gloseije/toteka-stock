import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { updateProductSchema } from "@/lib/validations";
import { z } from "zod";
import { getPublicUrl } from "@/lib/storage-actions";
import { roundCurrency } from "@/lib/currency";

export const GET = withAuth(async (request, { user }, params: { id: string }) => {
    try {
        const shop = await prisma.shop.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });

        if (!shop) {
            return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });
        }

        const product = await prisma.product.findUnique({
            where: { id: params.id },
            include: {
                category: { select: { id: true, name: true } },
                images: true,
                saleItems: {
                    include: {
                        sale: {
                            include: {
                                customer: { select: { name: true } },
                            },
                        },
                    },
                    orderBy: {
                        sale: {
                            soldAt: "desc",
                        },
                    },
                    take: 10,
                },
            },
        });

        if (!product || product.shopId !== shop.id) {
            return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
        }

        // Transformer les URLs d'images pour le local
        const productWithPublicUrls = {
            ...product,
            images: product.images.map((img) => ({
                ...img,
                url: getPublicUrl(img.key),
            })),
        };

        return NextResponse.json({ product: productWithPublicUrls });
    } catch (error) {
        console.error("GET /api/products/[id] error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
});

export const PATCH = withAuth(async (request, { user }, params: { id: string }) => {
    try {
        const shop = await prisma.shop.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });

        if (!shop) {
            return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });
        }

        const existingProduct = await prisma.product.findUnique({
            where: { id: params.id },
        });

        if (!existingProduct || existingProduct.shopId !== shop.id) {
            return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
        }

        const body = await request.json();
        const parsed = updateProductSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Données invalides", details: z.treeifyError(parsed.error) },
                { status: 400 }
            );
        }

        const { imageUrl, imageKey, ...updateData } = parsed.data;
        if (updateData.sellingPrice !== undefined)
            updateData.sellingPrice = roundCurrency(
                updateData.sellingPrice,
                updateData.currency ?? existingProduct.currency
            );
        if (updateData.purchasePrice !== undefined && updateData.purchasePrice !== null)
            updateData.purchasePrice = roundCurrency(
                updateData.purchasePrice,
                updateData.currency ?? existingProduct.currency
            );

        // Mise à jour de l'image si fournie ou supprimée
        if (imageUrl !== undefined) {
            // On supprime les anciennes images (pour simplifier, on garde une seule image principale)
            await prisma.productImage.deleteMany({
                where: { productId: params.id },
            });

            if (imageUrl && imageKey) {
                await prisma.productImage.create({
                    data: {
                        productId: params.id,
                        url: imageUrl,
                        key: imageKey,
                    },
                });
            }
        }

        const product = await prisma.product.update({
            where: { id: params.id },
            data: updateData,
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

        return NextResponse.json({ product: productWithUrl });
    } catch (error) {
        console.error("PATCH /api/products/[id] error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
});

export const DELETE = withAuth(async (request, { user }, params: { id: string }) => {
    try {
        const shop = await prisma.shop.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });

        if (!shop) {
            return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });
        }

        const existingProduct = await prisma.product.findUnique({
            where: { id: params.id },
        });

        if (!existingProduct || existingProduct.shopId !== shop.id) {
            return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
        }

        try {
            await prisma.product.delete({
                where: { id: params.id },
            });
        } catch (error) {
            // Check if error is related to foreign key constraints (sales or orders linked)
            // Prisma code for constraint violation is usually P2003
            if (
                error instanceof Error &&
                (error.message.includes("Foreign key constraint failed") ||
                    (typeof error === "object" &&
                        error !== null &&
                        "code" in error &&
                        error.code === "P2003"))
            ) {
                return NextResponse.json(
                    {
                        error: "Impossible de supprimer un produit ayant déjà fait l'objet de ventes ou de commandes.",
                    },
                    { status: 400 }
                );
            }
            console.error("DELETE /api/products/[id] error:", error);
            return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/products/[id] error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
});
