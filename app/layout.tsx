import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import React from "react";

const sora = Sora({
    subsets: ["latin"],
    variable: "--font-sora",
});

const appUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
    metadataBase: new URL(appUrl),
    title: {
        default: "Toteka Stock : gestion de stock et ventes pour commerçants",
        template: "%s | Toteka Stock",
    },
    description:
        "Toteka Stock aide les commerçants à gérer leurs produits, leurs ventes, leurs clients et leur stock. Factures PDF, alertes de stock bas et statistiques, en francs congolais.",
    keywords: [
        "gestion de stock",
        "logiciel de caisse",
        "ventes",
        "facturation",
        "RDC",
        "Congo",
        "Kinshasa",
        "commerce",
        "Mobile Money",
    ],
    applicationName: "Toteka Stock",
    authors: [{ name: "Toteka Stock" }],
    openGraph: {
        type: "website",
        locale: "fr_FR",
        url: appUrl,
        siteName: "Toteka Stock",
        title: "Toteka Stock : gestion de stock et ventes pour commerçants",
        description:
            "Gérez vos produits, ventes, clients et stock comme un commerce structuré. Factures PDF, alertes et statistiques.",
        images: [
            {
                url: "/logo.png",
                alt: "Toteka Stock",
            },
        ],
    },
    twitter: {
        card: "summary",
        title: "Toteka Stock : gestion de stock et ventes",
        description:
            "Gérez vos produits, ventes, clients et stock comme un commerce structuré.",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" className={`${sora.variable} h-full antialiased`}>
            <body className="min-h-full flex flex-col font-sans text-gray-700">
                {children}
                <Toaster position="top-right" richColors />
            </body>
        </html>
    );
}
