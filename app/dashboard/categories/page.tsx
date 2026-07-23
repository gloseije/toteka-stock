"use client";

import { useState } from "react";
import { Tag, Plus, Pencil, Trash2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
    id: string;
    name: string;
    productCount: number;
}

// ─── Shared classes ───────────────────────────────────────────────────────────

const inputCls =
    "w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-600 transition-colors bg-white";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
    // TODO: charger depuis l'API
    const [categories, setCategories] = useState<Category[]>([]);
    const [newName, setNewName] = useState("");
    const [adding, setAdding] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        // TODO: POST /api/categories
        const created: Category = {
            id: Date.now().toString(),
            name: newName.trim(),
            productCount: 0,
        };
        setCategories((prev) => [...prev, created]);
        setNewName("");
        setAdding(false);
    };

    const handleEdit = async (id: string) => {
        if (!editName.trim()) return;
        // TODO: PATCH /api/categories/:id
        setCategories((prev) =>
            prev.map((c) => (c.id === id ? { ...c, name: editName.trim() } : c))
        );
        setEditId(null);
    };

    const handleDelete = async (id: string) => {
        // TODO: DELETE /api/categories/:id — confirmation à ajouter
        setCategories((prev) => prev.filter((c) => c.id !== id));
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl w-full">
            {/* Header */}
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

            {/* Formulaire d'ajout */}
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

            {/* Liste */}
            {categories.length === 0 && !adding ? (
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
            )}
        </div>
    );
}
