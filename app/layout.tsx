import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import React from "react";

const sora = Sora({
    subsets: ["latin"],
    variable: "--font-sora",
});

export const metadata: Metadata = {
    title: "Toteka Stock",
    description: "Gérez vos ventes comme un commerce structuré.",
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
