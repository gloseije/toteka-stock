export * from "@prisma/client";

import type { Prisma } from "@prisma/client";

export type ProductWithCategoryAndImages = Prisma.ProductGetPayload<{
    include: { category: true; images: true };
}>;

export type ProductWithSales = Prisma.ProductGetPayload<{
    include: {
        category: true;
        images: true;
        saleItems: { include: { sale: { include: { customer: true } } } };
    };
}>;

export type SaleWithDetails = Prisma.SaleGetPayload<{
    include: {
        customer: true;
        items: { include: { product: true } };
    };
}>;

export type SerializedSale = Omit<SaleWithDetails, 'totalAmount' | 'totalCost' | 'profit' | 'items'> & {
    totalAmount: number;
    totalCost: number;
    profit: number;
    items: Array<Omit<SaleWithDetails['items'][number], 'unitPrice' | 'totalPrice' | 'totalCost' | 'unitCost' | 'product'> & {
        unitPrice: number;
        totalPrice: number;
        totalCost: number | null;
        unitCost: number | null;
        product: Omit<SaleWithDetails['items'][number]['product'], 'sellingPrice' | 'purchasePrice'> & {
            sellingPrice: number;
            purchasePrice: number;
        };
    }>;
};

export type ProductSummary = Pick<
    Prisma.ProductGetPayload<{
        select: { id: true; name: true; sellingPrice: true; currency: true; stock: true };
    }>,
    "id" | "name" | "sellingPrice" | "currency" | "stock"
>;
export type CustomerSummary = Pick<
    Prisma.CustomerGetPayload<{ select: { id: true; name: true } }>,
    "id" | "name"
>;

export type SaleList = Prisma.SaleGetPayload<{
    include: {
        customer: { select: { name: true } };
        items: { include: { product: { select: { name: true } } } };
    };
}>;

export type SaleListApi = Omit<SaleList, "totalAmount" | "soldAt" | "createdAt" | "updatedAt"> & {
    totalAmount: number;
    soldAt: string;
    createdAt: string;
    updatedAt: string;
};

export type ProductList = Prisma.ProductGetPayload<{
    include: {
        category: { select: { name: true } };
        images: { select: { key: true; url: true }; take: 1 };
    };
}>;
