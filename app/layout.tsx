import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React from "react";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Toteka Stock",
    description: "Gestion des ventes WhatsApp pour les commerçants en RDC.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" className={`${inter.variable} h-full antialiased`}>
            <body className="min-h-full flex flex-col font-sans">{children}</body>
        </html>
    );
}
