import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { updateCustomerSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
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

        const customer = await prisma.customer.findFirst({
            where: {
                id,
                shopId: shop.id,
            },
            include: {
                sales: {
                    include: {
                        items: {
                            include: {
                                product: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        soldAt: "desc",
                    },
                },
            },
        });

        if (!customer) {
            return new NextResponse("Customer not found", { status: 404 });
        }

        return NextResponse.json({ customer });
    } catch (error) {
        console.error("[CUSTOMER_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

        const body = await req.json();
        const validatedData = updateCustomerSchema.parse(body);

        const customer = await prisma.customer.updateMany({
            where: {
                id,
                shopId: shop.id,
            },
            data: validatedData,
        });

        if (customer.count === 0) {
            return new NextResponse("Customer not found", { status: 404 });
        }

        const updatedCustomer = await prisma.customer.findUnique({
            where: { id },
            include: {
                sales: {
                    include: {
                        items: {
                            include: {
                                product: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        soldAt: "desc",
                    },
                },
            },
        });

        return NextResponse.json({ customer: updatedCustomer });
    } catch (error) {
        console.error("[CUSTOMER_PATCH]", error);
        if (error instanceof Error && error.name === "ZodError") {
            return new NextResponse(JSON.stringify(error), { status: 400 });
        }
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
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

        try {
            await prisma.customer.delete({
                where: { id },
            });
        } catch (error) {
            // Check for foreign key constraints (sales or orders linked)
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
                return NextResponse.json(
                    {
                        error: "Impossible de supprimer un client ayant déjà passé des commandes ou effectué des achats.",
                    },
                    { status: 400 }
                );
            }
            console.error("[CUSTOMER_DELETE_INNER]", error);
            return new NextResponse("Internal Error", { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[CUSTOMER_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
