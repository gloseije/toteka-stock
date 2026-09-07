import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { categorySchema } from "@/lib/validations";
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

        // Verify the category belongs to this shop
        const existingCategory = await prisma.category.findUnique({
            where: { id: params.id },
        });

        if (!existingCategory || existingCategory.shopId !== shop.id) {
            return NextResponse.json({ error: "Catégorie non trouvée" }, { status: 404 });
        }

        const body = await request.json();
        const parsed = categorySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Données invalides", details: z.treeifyError(parsed.error) },
                { status: 400 }
            );
        }

        const category = await prisma.category.update({
            where: { id: params.id },
            data: {
                name: parsed.data.name,
            },
        });

        return NextResponse.json({ category });
    } catch (error) {
        console.error("PATCH /api/categories/[id] error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
});

export const DELETE = withAuth(async (_request, { user }, params: { id: string }) => {
    try {
        const shop = await prisma.shop.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });

        if (!shop) {
            return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });
        }

        // Verify the category belongs to this shop
        const existingCategory = await prisma.category.findUnique({
            where: { id: params.id },
        });

        if (!existingCategory || existingCategory.shopId !== shop.id) {
            return NextResponse.json({ error: "Catégorie non trouvée" }, { status: 404 });
        }

        try {
            await prisma.category.delete({
                where: { id: params.id },
            });
        } catch (error) {
            // Check if error is related to foreign key constraints (products linked)
            if (error instanceof Error && error.message.includes("Foreign key constraint failed")) {
                return NextResponse.json(
                    { error: "Impossible de supprimer une catégorie contenant des produits." },
                    { status: 400 }
                );
            }
            console.error("DELETE /api/categories/[id] error:", error);
            return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/categories/[id] error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
});
