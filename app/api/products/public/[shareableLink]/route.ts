import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ shareableLink: string }> }
) {
    try {
        const { shareableLink } = await params;
        const product = await prisma.product.findUnique({
            where: { shareableLink },
            include: {
                shop: {
                    select: {
                        name: true,
                        slug: true,
                        logoUrl: true,
                        phone: true,
                        whatsapp: true,
                        currency: true,
                    },
                },
                category: {
                    select: {
                        name: true,
                    }
                }
            },
        });

        if (!product) {
            return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
        }

        if (!product.isPublic || product.isArchived) {
            return NextResponse.json({ error: "Ce produit n'est plus disponible" }, { status: 403 });
        }

        // Return a subset of product details safe for public viewing
        return NextResponse.json({
            product: {
                id: product.id,
                name: product.name,
                description: product.description,
                sellingPrice: product.sellingPrice,
                unit: product.unit,
                stock: product.stock, // Sometimes merchants hide stock, but we'll include it or just a boolean `inStock`
                inStock: product.stock > 0,
                shop: product.shop,
                category: product.category,
            }
        });
    } catch (error) {
        console.error("GET /api/products/public/[shareableLink] error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
