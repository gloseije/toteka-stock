import {
    BarChart3,
    TrendingUp,
    DollarSign,
    Package,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatCardProps {
    title: string;
    value: string;
    trend?: {
        value: string;
        positive: boolean;
    };
    Icon: typeof BarChart3;
}

interface TopProduct {
    id: string;
    name: string;
    sales: number;
    revenue: number;
}

// ─── Components ───────────────────────────────────────────────────────────────

function StatCard({ title, value, trend, Icon }: StatCardProps) {
    return (
        <div className="bg-white border border-gray-200 rounded p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {title}
                </span>
                <div className="p-2 bg-purple-50 text-purple-600 rounded">
                    <Icon className="w-4 h-4" />
                </div>
            </div>
            <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-gray-900">{value}</span>
                {trend && (
                    <div
                        className={`flex items-center gap-1 text-xs font-bold ${trend.positive ? "text-green-600" : "text-red-600"}`}
                    >
                        {trend.positive ? (
                            <ArrowUpRight className="w-3 h-3" />
                        ) : (
                            <ArrowDownRight className="w-3 h-3" />
                        )}
                        {trend.value}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StatsPage() {
    // Mock data
    const stats = [
        {
            title: "Chiffre d'affaires",
            value: "2.450.000 Fc",
            trend: { value: "12%", positive: true },
            Icon: DollarSign,
        },
        {
            title: "Bénéfice estimé",
            value: "840.000 Fc",
            trend: { value: "8%", positive: true },
            Icon: TrendingUp,
        },
        {
            title: "Commandes",
            value: "124",
            trend: { value: "5%", positive: false },
            Icon: BarChart3,
        },
        { title: "Produits vendus", value: "458", Icon: Package },
    ];

    const topProducts: TopProduct[] = [
        { id: "1", name: "Produit A", sales: 145, revenue: 450000 },
        { id: "2", name: "Produit B", sales: 98, revenue: 294000 },
        { id: "3", name: "Produit C", sales: 84, revenue: 168000 },
        { id: "4", name: "Produit D", sales: 72, revenue: 144000 },
    ];

    const evolutionData = [
        { label: "Lun", value: 40 },
        { label: "Mar", value: 65 },
        { label: "Mer", value: 45 },
        { label: "Jeu", value: 80 },
        { label: "Ven", value: 55 },
        { label: "Sam", value: 90 },
        { label: "Dim", value: 70 },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-8 max-w-7xl w-full">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Statistiques</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Aperçu des performances sur les 30 derniers jours.
                </p>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <StatCard key={i} {...s} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Evolution Chart (Custom CSS) */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded p-6 flex flex-col gap-6">
                    <h2 className="text-sm font-bold text-gray-900">Évolution des ventes</h2>
                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                        {evolutionData.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                <div
                                    className="w-full max-w-10 bg-purple-600 rounded-t transition-all duration-500 hover:bg-purple-700"
                                    style={{ height: `${d.value}%` }}
                                />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    {d.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white border border-gray-200 rounded p-6 flex flex-col gap-6">
                    <h2 className="text-sm font-bold text-gray-900">Top Produits</h2>
                    <div className="flex flex-col gap-4">
                        {topProducts.map((p) => (
                            <div
                                key={p.id}
                                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                            >
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-semibold text-gray-900">
                                        {p.name}
                                    </span>
                                    <span className="text-xs text-gray-500">{p.sales} ventes</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">
                                    {p.revenue.toLocaleString("fr-FR")} Fc
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
