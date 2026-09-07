import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const shop = await prisma.shop.findUnique({
            where: { userId: session.user.id },
        });

        if (!shop) {
            return new NextResponse("Shop not found", { status: 404 });
        }

        const sales = await prisma.sale.findMany({
            where: {
                customerId: id,
                shopId: shop.id,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: {
                soldAt: "desc",
            },
        });

        return NextResponse.json(sales);
    } catch (error) {
        console.error("[CUSTOMER_SALES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
