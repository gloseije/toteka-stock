import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { customerSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";
import { isAccessActive } from "@/lib/beta";
import { ensureTrialSubscription } from "@/lib/subscription";

export async function GET(req: Request) {
    try {
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

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(
            100,
            Math.max(1, Number.parseInt(searchParams.get("limit") || "10", 10))
        );
        const skip = (page - 1) * limit;
        const sort = searchParams.get("sort") || "name";
        const order = searchParams.get("order") === "desc" ? "desc" : "asc";

        const where = {
            shopId: shop.id,
            ...(search
                ? {
                      OR: [
                          { name: { contains: search, mode: "insensitive" as const } },
                          { phone: { contains: search, mode: "insensitive" as const } },
                      ],
                  }
                : {}),
        };

        const orderBy: Prisma.CustomerOrderByWithRelationInput =
            sort === "createdAt" || sort === "name" ? { [sort]: order } : { name: order };

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    sales: { select: { totalAmount: true } },
                },
            }),
            prisma.customer.count({ where }),
        ]);

        return NextResponse.json({
            customers: customers.map((c) => ({
                id: c.id,
                name: c.name,
                phone: c.phone,
                whatsapp: c.whatsapp,
                address: c.address,
                createdAt: c.createdAt,
                totalSales: c.sales.length,
                totalSpent: c.sales.reduce((acc, s) => acc + Number(s.totalAmount), 0),
            })),
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                limit,
            },
        });
    } catch (error) {
        console.error("[CUSTOMERS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
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

        const subscription = await ensureTrialSubscription(
            session.user.id,
            new Date(session.user.createdAt)
        );
        if (!isAccessActive(subscription.currentPeriodEnd)) {
            return NextResponse.json(
                { error: "Essai expiré : un abonnement actif est requis." },
                { status: 402 }
            );
        }

        const body = await req.json();
        const validatedData = customerSchema.parse(body);

        const customer = await prisma.customer.create({
            data: {
                ...validatedData,
                shopId: shop.id,
            },
        });

        return NextResponse.json(customer);
    } catch (error) {
        console.error("[CUSTOMERS_POST]", error);
        if (error instanceof Error && error.name === "ZodError") {
            return new NextResponse(JSON.stringify(error), { status: 400 });
        }
        return new NextResponse("Internal Error", { status: 500 });
    }
}
