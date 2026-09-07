import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { z } from "zod";

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
        const parsed = z.object({ isArchived: z.boolean() }).safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Données invalides", details: z.treeifyError(parsed.error) },
                { status: 400 }
            );
        }

        const product = await prisma.product.update({
            where: { id: params.id },
            data: {
                isArchived: parsed.data.isArchived,
            },
        });

        return NextResponse.json({ product });
    } catch (error) {
        console.error("PATCH /api/products/[id]/archive error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
});
