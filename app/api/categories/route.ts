import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, withActiveSubscription } from "@/lib/auth-guard";
import { categorySchema } from "@/lib/validations";
import { z } from "zod";
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
        const search = searchParams.get("search") || "";
        const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, Number.parseInt(searchParams.get("limit") ?? "20", 10) || 20)
        );
        const sort = searchParams.get("sort") || "name";
        const order = searchParams.get("order") === "desc" ? "desc" : "asc";

        const where: Prisma.CategoryWhereInput = {
            shopId: shop.id,
            ...(search
                ? {
                      name: { contains: search, mode: "insensitive" as const },
                  }
                : {}),
        };

        const [categories, total] = await Promise.all([
            prisma.category.findMany({
                where,
                orderBy: { [sort]: order } as Prisma.CategoryOrderByWithRelationInput,
                skip: (page - 1) * limit,
                take: limit,
                include: { _count: { select: { products: true } } },
            }),
            prisma.category.count({ where }),
        ]);

        return NextResponse.json({
            categories: categories.map(({ _count, ...category }) => ({
                ...category,
                productCount: _count.products,
            })),
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error("GET /api/categories error:", error);
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
        const parsed = categorySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Données invalides", details: z.treeifyError(parsed.error) },
                { status: 400 }
            );
        }

        const category = await prisma.category.create({
            data: {
                shopId: shop.id,
                name: parsed.data.name,
            },
        });

        return NextResponse.json({ category }, { status: 201 });
    } catch (error) {
        console.error("POST /api/categories error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
});
