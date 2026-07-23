import Link from "next/link";

const columns = [
    {
        title: "Produit",
        links: [
            { label: "Fonctionnalités", href: "/features" },
            { label: "Tarifs", href: "/pricing" },
        ],
    },
    {
        title: "Légal",
        links: [
            { label: "Mentions légales", href: "/mentions-legales" },
            { label: "Confidentialité", href: "/confidentialite" },
        ],
    },
    {
        title: "Support",
        links: [
            { label: "Contact", href: "/contact" },
        ],
    },
];

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100">

            {/* Main */}
            <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-10">

                {/* Brand */}
                <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-xs shrink-0">
                            T
                        </div>
                        <span className="font-bold text-gray-900 text-sm">Toteka Stock</span>
                    </Link>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-[200px]">
                        Gestion des ventes  pour les commerçants en RDC.
                    </p>
                </div>

                {/* Link columns */}
                {columns.map(({ title, links }) => (
                    <div key={title} className="flex flex-col gap-3">
                        <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                            {title}
                        </p>
                        <nav className="flex flex-col gap-2.5">
                            {links.map(({ label, href }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
                                >
                                    {label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                ))}

            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-100">
                <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-gray-400">© 2026 Toteka. Tous droits réservés.</p>
                    <p className="text-xs text-gray-400">
                        Paiement : Airtel Money · Orange Money · M-Pesa
                    </p>
                </div>
            </div>

        </footer>
    );
}
