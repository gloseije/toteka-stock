import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        if (!slug) {
            return NextResponse.json({ error: "Slug manquant" }, { status: 400 });
        }

        const shop = await prisma.shop.findUnique({
            where: { slug },
            include: {
                categories: true,
                products: {
                    where: {
                        isArchived: false,
                        isPublic: true,
                    },
                    include: {
                        images: true,
                    }
                }
            }
        });

        if (!shop) {
            return NextResponse.json({ error: "Boutique non trouvée" }, { status: 404 });
        }

        if (!shop.isPublic) {
            return NextResponse.json({ error: "Cette boutique est privée" }, { status: 403 });
        }

        // We can omit sensitive info like userId, etc. if needed, but for now we return the shop
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { userId, ...publicShopData } = shop;

        return NextResponse.json({ shop: publicShopData });
    } catch (error) {
        console.error("GET /api/shop/public/[slug] error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
