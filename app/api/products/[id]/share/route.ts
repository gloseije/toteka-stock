import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";

function generateShareableLink(): string {
    return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

export const POST = withAuth(async (_request, { user }, params: { id: string }) => {
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
        });

        if (!product || product.shopId !== shop.id) {
            return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
        }

        let link = product.shareableLink;

        if (!link) {
            link = generateShareableLink();
            await prisma.product.update({
                where: { id: params.id },
                data: { shareableLink: link },
            });
        }

        return NextResponse.json({ shareableLink: link });
    } catch (error) {
        console.error("POST /api/products/[id]/share error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
});
