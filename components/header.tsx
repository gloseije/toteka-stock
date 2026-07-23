"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const navLinks = [
    { label: "Accueil", href: "/" },
    { label: "Fonctionnalités", href: "/features" },
    { label: "Tarifs", href: "/pricing" },
];

export default function Header() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const handleSignOut = async () => {
        try {
            await authClient.signOut();
            router.replace("/login");
            router.refresh();
        } catch (error) {
            console.error("Sign out failed", error);
            if (typeof window !== "undefined") {
                window.location.assign("/login");
            }
        }
    };

    const getLinkClassName = (href: string) => {
        const isActive = pathname === href;
        return `text-sm transition-colors px-3 py-2 rounded ${
            isActive
                ? "text-purple-600 bg-purple-50 font-semibold"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
        }`;
    };

    const getMobileLinkClassName = (href: string) => {
        const isActive = pathname === href;
        return `text-sm transition-colors px-3 py-2.5 rounded ${
            isActive
                ? "text-purple-600 bg-purple-50 font-semibold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        }`;
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-xs shrink-0">
                        T
                    </div>
                    <span className="font-bold text-gray-900 tracking-tight">Toteka Stock</span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map(({ label, href }) => (
                        <Link key={href} href={href} className={getLinkClassName(href)}>
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* Desktop auth */}
                <div className="hidden md:flex items-center gap-3">
                    {!session ? (
                        <>
                            <Link
                                href="/login"
                                className="text-sm text-gray-500 hover:text-gray-900 transition-colors px-3 py-2"
                            >
                                Connexion
                            </Link>
                            <Link
                                href="/register"
                                className="text-sm font-semibold bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-900 transition-colors"
                            >
                                Inscription
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/dashboard"
                                className="text-sm font-semibold bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-900 transition-colors"
                            >
                                Tableau de bord
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-2 flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Déconnexion
                            </button>
                        </>
                    )}
                </div>

                {/* Mobile burger */}
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="md:hidden p-2 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
                >
                    {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-1">
                    {navLinks.map(({ label, href }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setOpen(false)}
                            className={getMobileLinkClassName(href)}
                        >
                            {label}
                        </Link>
                    ))}
                    {session && (
                        <Link
                            href="/dashboard"
                            onClick={() => setOpen(false)}
                            className={getMobileLinkClassName("/dashboard")}
                        >
                            Tableau de bord
                        </Link>
                    )}
                    <div className="border-t border-gray-100 mt-2 pt-3 flex flex-col gap-2">
                        {!session ? (
                            <>
                                <Link
                                    href="/login"
                                    onClick={() => setOpen(false)}
                                    className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2.5 rounded hover:bg-gray-50 transition-colors"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setOpen(false)}
                                    className="text-sm font-semibold text-center bg-purple-600 text-white px-4 py-2.5 rounded hover:bg-purple-900 transition-colors"
                                >
                                    Inscription
                                </Link>
                            </>
                        ) : (
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    handleSignOut();
                                }}
                                className="text-sm text-gray-600 hover:text-red-600 px-3 py-2.5 rounded hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Déconnexion
                            </button>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
