"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Tag, Plus, Pencil, Trash2 } from "lucide-react";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton, SkeletonListItem } from "@/components/skeleton";

const inputCls =
    "w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-600 transition-colors bg-white";

const SORT_OPTIONS = [
    { value: "name:asc", label: "Nom : A → Z" },
    { value: "name:desc", label: "Nom : Z → A" },
    { value: "createdAt:desc", label: "Date : récent → ancien" },
    { value: "createdAt:asc", label: "Date : ancien → récent" },
];

interface Category {
    id: string;
    name: string;
    productCount: number;
}

interface CategoriesResponse {
    categories: Category[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

function CategoriesContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(
        100,
        Math.max(1, Number.parseInt(searchParams.get("limit") ?? "20", 10) || 20)
    );
    const search = searchParams.get("search") || "";
    const sortValue = searchParams.get("sort") || "name:asc";

    const [categories, setCategories] = useState<Category[]>([]);
    const [pagination, setPagination] = useState<CategoriesResponse["pagination"] | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [newName, setNewName] = useState("");
    const [adding, setAdding] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.set("page", String(page));
                params.set("limit", String(limit));
                if (search) params.set("search", search);
                if (sortValue) {
                    const [sort, order] = sortValue.split(":");
                    params.set("sort", sort);
                    params.set("order", order);
                }

                const res = await fetch(`/api/categories?${params.toString()}`);
                if (res.ok) {
                    const data = (await res.json()) as CategoriesResponse;
                    setCategories(data.categories);
                    setPagination(data.pagination);
                }
            } catch (error) {
                console.error("Fetch categories error:", error);
            } finally {
                setLoading(false);
            }
        };
        void fetchCategories();
    }, [page, limit, search, sortValue, refreshKey]);

    const updateParam = (key: string, value: string | null) => {
        const next = new URLSearchParams(searchParams.toString());
        if (value === null || value === "") {
            next.delete(key);
        } else {
            next.set(key, value);
        }
        next.delete("page");
        router.push(`${pathname}?${next.toString()}`);
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName.trim() }),
            });

            if (res.ok) {
                setNewName("");
                setAdding(false);
                setRefreshKey((k) => k + 1);
            } else {
                alert("Erreur lors de la création de la catégorie");
            }
        } catch (error) {
            console.error("Add category error:", error);
            alert("Erreur serveur");
        }
    };

    const handleEdit = async (id: string) => {
        if (!editName.trim()) return;

        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName.trim() }),
            });

            if (res.ok) {
                setEditId(null);
                setRefreshKey((k) => k + 1);
            } else {
                alert("Erreur lors de la modification");
            }
        } catch (error) {
            console.error("Edit category error:", error);
            alert("Erreur serveur");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cette catégorie ?")) return;

        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setRefreshKey((k) => k + 1);
            } else {
                alert("Erreur lors de la suppression");
            }
        } catch (error) {
            console.error("Delete category error:", error);
            alert("Erreur serveur");
        }
    };



    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl w-full">
            <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Catégories</h1>
                {!adding && (
                    <button
                        onClick={() => setAdding(true)}
                        className="flex items-center gap-2 text-sm font-semibold bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Nouvelle catégorie
                    </button>
                )}
            </div>

            <DataToolbar
                search={search}
                onSearchChange={(value) => updateParam("search", value)}
                searchPlaceholder="Rechercher une catégorie..."
                sort={sortValue}
                onSortChange={(value) => updateParam("sort", value)}
                sortOptions={SORT_OPTIONS}
            />

            {adding && (
                <form
                    onSubmit={handleAdd}
                    className="bg-white border border-gray-200 rounded p-4 flex items-center gap-3"
                >
                    <input
                        autoFocus
                        type="text"
                        placeholder="Nom de la catégorie"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className={inputCls}
                    />
                    <button
                        type="submit"
                        disabled={!newName.trim()}
                        className="text-sm font-semibold bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors disabled:opacity-40 shrink-0"
                    >
                        Ajouter
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setAdding(false);
                            setNewName("");
                        }}
                        className="text-sm text-gray-400 hover:text-gray-700 transition-colors shrink-0"
                    >
                        Annuler
                    </button>
                </form>
            )}

            {loading ? (
                <div className="bg-white border border-gray-200 rounded overflow-hidden">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <SkeletonListItem key={i} />
                    ))}
                </div>
            ) : categories.length === 0 && !adding ? (
                <div className="bg-white border border-gray-200 rounded flex flex-col items-center justify-center py-16 gap-3">
                    <Tag className="w-9 h-9 text-gray-200" />
                    <p className="text-sm font-medium text-gray-500">Aucune catégorie</p>
                    <p className="text-xs text-center text-gray-400">
                        Organisez vos produits par catégorie pour les retrouver plus facilement.
                    </p>
                    <button
                        onClick={() => setAdding(true)}
                        className="mt-2 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                    >
                        Créer une catégorie
                    </button>
                </div>
            ) : (
                <>
                    <div className="bg-white border border-gray-200 rounded overflow-hidden divide-y divide-gray-100">
                        {categories.map((cat) => (
                            <div key={cat.id} className="flex items-center gap-3 px-4 py-3">
                                {editId === cat.id ? (
                                    <>
                                        <input
                                            autoFocus
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className={inputCls + " flex-1"}
                                        />
                                        <button
                                            onClick={() => handleEdit(cat.id)}
                                            disabled={!editName.trim()}
                                            className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors disabled:opacity-40"
                                        >
                                            Enregistrer
                                        </button>
                                        <button
                                            onClick={() => setEditId(null)}
                                            className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                                        >
                                            Annuler
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Tag className="w-4 h-4 text-gray-300 shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {cat.name}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {cat.productCount === 0
                                                    ? "Aucun produit"
                                                    : `${cat.productCount} produit${cat.productCount > 1 ? "s" : ""}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditId(cat.id);
                                                    setEditName(cat.name);
                                                }}
                                                className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                                                aria-label="Modifier"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id)}
                                                disabled={cat.productCount > 0}
                                                className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                aria-label="Supprimer"
                                                title={
                                                    cat.productCount > 0
                                                        ? "Retirez d'abord tous les produits de cette catégorie"
                                                        : undefined
                                                }
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                    {pagination && (
                        <Pagination
                            page={pagination.page}
                            pages={pagination.pages}
                            total={pagination.total}
                            limit={pagination.limit}
                            buildHref={(p) => {
                                const next = new URLSearchParams(searchParams.toString());
                                next.set("page", String(p));
                                return `${pathname}?${next.toString()}`;
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
}

function CategoriesFallback() {
    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl w-full">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-10 w-40" />
            </div>
            <Skeleton className="h-10 w-full max-w-md" />
            <div className="bg-white border border-gray-200 rounded overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonListItem key={i} />
                ))}
            </div>
        </div>
    );
}

export default function CategoriesPage() {
    return (
        <Suspense fallback={<CategoriesFallback />}>
            <CategoriesContent />
        </Suspense>
    );
}
