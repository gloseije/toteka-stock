"use client";

import Link from "next/link";
import { ChevronDown, CreditCard, LogOut, Menu, Settings } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";

interface DashboardHeaderProps {
    onMenuClick: () => void;
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const router = useRouter();
    const { data: session } = authClient.useSession();

    const handleSignOut = async () => {
        try {
            await authClient.signOut();
            setUserMenuOpen(false);
            router.replace("/login");
            router.refresh();
        } catch (error) {
            console.error("Sign out failed", error);
            if (typeof window !== "undefined") {
                window.location.assign("/login");
            }
        }
    };

    const getInitial = (name?: string | null, email?: string | null) => {
        const source = name?.trim() || email?.trim() || "U";
        return source.charAt(0).toUpperCase();
    };

    return (
        <header className="fixed inset-x-0 top-0 z-50 flex h-14 w-full items-center justify-between border-b border-purple-100/50 bg-white px-4 lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-1">
                <Image
                    src="/toteka-stock-logo-primaire.svg"
                    alt="Toteka Stock"
                    width={160}
                    height={50}
                />
            </Link>

            <div className="flex items-center gap-2">
                {session ? (
                    <>
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen((value) => !value)}
                                className="flex items-center gap-2 rounded px-2 py-2 transition-colors hover:bg-gray-50 lg:gap-3 lg:px-3"
                            >
                                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-purple-600 text-sm font-semibold text-white">
                                    {session.user.image ? (
                                        <Image
                                            src={session.user.image}
                                            alt={session.user.name || "Avatar utilisateur"}
                                            width={36}
                                            height={36}
                                            className="h-full w-full object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        getInitial(session.user.name, session.user.email)
                                    )}
                                </div>
                                <div className="hidden text-left lg:block">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {session.user.name || "Utilisateur"}
                                    </p>
                                    <p className="text-xs text-gray-500">{session.user.email}</p>
                                </div>
                                <ChevronDown className="hidden h-4 w-4 text-gray-400 lg:block" />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 rounded border border-gray-200 bg-white py-2 shadow-sm">
                                    <div className="border-b border-gray-100 px-3 py-2 lg:block">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {session.user.name || "Utilisateur"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {session.user.email}
                                        </p>
                                    </div>
                                    <Link
                                        href="/dashboard/settings"
                                        onClick={() => setUserMenuOpen(false)}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                                    >
                                        <Settings className="h-4 w-4" />
                                        Mon compte
                                    </Link>
                                    <Link
                                        href="/dashboard/subscription"
                                        onClick={() => setUserMenuOpen(false)}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        Abonnement
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Déconnexion
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <Link
                        href="/login"
                        className="hidden rounded bg-purple-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-900 lg:block"
                    >
                        Connexion
                    </Link>
                )}

                <button
                    onClick={onMenuClick}
                    className="rounded p-2 text-purple-600 transition-colors hover:bg-purple-50 lg:hidden"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
}
