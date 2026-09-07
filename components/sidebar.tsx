"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Tag,
    ShoppingCart,
    Users,
    BarChart3,
    Store,
    X,
    type LucideIcon,
} from "lucide-react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

type Plan = "FREE" | "STANDARD" | "PRO";

interface NavItem {
    label: string;
    href: string;
    Icon: LucideIcon;
    plan?: Plan;
}

interface NavGroup {
    title?: string;
    items: NavItem[];
}

// ─── Navigation ───────────────────────────────────────────────────────────────

const groups: NavGroup[] = [
    {
        items: [
            { label: "Tableau de bord", href: "/dashboard", Icon: LayoutDashboard },
            { label: "Boutique", href: "/dashboard/shop", Icon: Store },
        ],
    },
    {
        title: "Catalogue",
        items: [
            { label: "Produits", href: "/dashboard/products", Icon: Package },
            { label: "Catégories", href: "/dashboard/categories", Icon: Tag },
        ],
    },
    {
        title: "Commerce",
        items: [
            { label: "Ventes", href: "/dashboard/sales", Icon: ShoppingCart },
            { label: "Clients", href: "/dashboard/customers", Icon: Users },
        ],
    },
    {
        title: "Analyse",
        items: [{ label: "Statistiques", href: "/dashboard/stats", Icon: BarChart3 }],
    },
];

// ─── Plan label ───────────────────────────────────────────────────────────────

const planLabel: Record<Plan, string> = {
    FREE: "Gratuit",
    STANDARD: "Standard",
    PRO: "Pro",
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) =>
        href === "/dashboard" ? pathname === href : pathname.startsWith(href);

    const itemClass = (href: string, locked = false) =>
        [
            "flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors",
            locked
                ? "text-gray-300 cursor-default"
                : isActive(href)
                  ? "bg-purple-50 text-purple-700 font-medium"
                  : "text-gray-600 hover:bg-purple-50/50 hover:text-purple-900",
        ].join(" ");

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-purple-900/20 backdrop-blur-sm z-50 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={[
                    "w-64 shrink-0 flex flex-col bg-white border-r border-purple-100/50 z-50 transition-transform duration-300",
                    "fixed left-0 top-0 h-screen lg:h-screen lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                ].join(" ")}
            >
                <div className={"flex justify-between px-4 lg:px-6"}>
                    {/* Logo */}
                    <div className="flex items-center h-14 border-b border-purple-50">
                        <Image
                            src="/toteka-stock-logo-primaire.svg"
                            alt="Toteka Stock"
                            width={160}
                            height={50}
                        />
                    </div>

                    {/* Close button for mobile */}
                    <div className="lg:hidden flex justify-end p-2 border-b border-purple-50">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-5 px-3">
                    {groups.map((group, i) => (
                        <div key={i} className="flex flex-col gap-0.5">
                            {group.title && (
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-3 mb-1">
                                    {group.title}
                                </p>
                            )}
                            {group.items.map(({ label, href, Icon, plan }) => (
                                <Link
                                    key={href}
                                    href={plan ? "#" : href}
                                    className={itemClass(href, !!plan)}
                                    aria-disabled={!!plan}
                                    onClick={() => !plan && setIsOpen(false)}
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                    <span className="flex-1">{label}</span>
                                    {plan && (
                                        <span className="text-[9px] font-semibold uppercase tracking-wide text-gray-300">
                                            {planLabel[plan]}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
}
