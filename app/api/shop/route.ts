import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { z } from "zod";
import { shopSchema } from "@/lib/validations";

function generateSlug(name: string): string {
    return (
        name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "") +
        "-" +
        Math.random().toString(36).substring(2, 8)
    );
}

export const GET = withAuth(async (_request, { user }) => {
    try {
        const shop = await prisma.shop.findUnique({
            where: { userId: user.id },
        });

        if (!shop) {
            return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });
        }

        return NextResponse.json({ shop });
    } catch (error) {
        console.error("GET /api/shop error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
});

export const POST = withAuth(async (request, { user }) => {
    try {
        const existingShop = await prisma.shop.findUnique({
            where: { userId: user.id },
        });

        if (existingShop) {
            return NextResponse.json({ error: "Vous avez déjà une boutique" }, { status: 400 });
        }

        const body = await request.json();
        const parsed = shopSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Données invalides", details: z.treeifyError(parsed.error) },
                { status: 400 }
            );
        }

        const { name, city, category, currency } = parsed.data;
        const slug = generateSlug(name);

        const shop = await prisma.shop.create({
            data: {
                userId: user.id,
                name,
                slug,
                city,
                currency,
            },
        });

        await prisma.category.create({
            data: {
                shopId: shop.id,
                name: category,
            },
        });

        return NextResponse.json({ shop }, { status: 201 });
    } catch (error) {
        console.error("POST /api/shop error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
});

export const PATCH = withAuth(async (request, { user }) => {
    try {
        const body = await request.json();

        const updateSchema = z.object({
            name: z.string().trim().min(2).optional(),
            slug: z.string().trim().min(2).optional(),
            description: z.string().optional().nullable(),
            logoUrl: z.string().optional().nullable(),
            phone: z.string().optional().nullable(),
            whatsapp: z.string().optional().nullable(),
            address: z.string().optional().nullable(),
            city: z.string().optional().nullable(),
            exchangeRate: z.coerce.number().positive().optional(),
            isPublic: z.boolean().optional(),
        });

        const parsed = updateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Données invalides", details: z.treeifyError(parsed.error) },
                { status: 400 }
            );
        }

        const shop = await prisma.shop.update({
            where: { userId: user.id },
            data: parsed.data,
        });

        return NextResponse.json({ shop });
    } catch (error) {
        console.error("PATCH /api/shop error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
});

export const DELETE = withAuth(async (_request, { user }) => {
    try {
        await prisma.shop.delete({
            where: { userId: user.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/shop error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
});
