"use client";

import React, { useState, useRef } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string, key: string) => void;
    onRemove: () => void;
    label?: string;
    className?: string;
}

export default function ImageUpload({
    value,
    onChange,
    onRemove,
    label,
    className = "",
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // 1. Obtenir l'URL présignée
            const res = await fetch("/api/upload/url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contentType: file.type }),
            });

            if (!res.ok) {
                console.error("Échec de la génération de l'URL d'upload");
                alert("Erreur lors de l'upload de l'image.");
                setUploading(false);
                return;
            }
            const { url, key } = await res.json();

            // 2. Uploader vers Rustfs/R2 via Proxy pour éviter CORS en local
            const uploadRes = await fetch("/api/upload/proxy", {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
                    "x-upload-url": url,
                },
            });

            if (!uploadRes.ok) {
                const errorText = await uploadRes.text();
                console.error("[IMAGE_UPLOAD_ERROR]", errorText);
                alert("Erreur lors de l'upload de l'image.");
                setUploading(false);
                return;
            }

            // 3. Obtenir l'URL publique (via une autre route API pour être sûr de la cohérence serveur/client)
            const publicRes = await fetch(`/api/upload/public-url?key=${key}`);
            const { publicUrl } = await publicRes.json();

            onChange(publicUrl, key);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Erreur lors de l'upload de l'image.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className={className}>
            {label && (
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
            )}

            {value ? (
                <div className="relative w-full aspect-square max-w-50 border border-gray-200 rounded overflow-hidden group">
                    <Image
                        src={value}
                        alt="Upload"
                        fill
                        className="object-cover"
                        sizes="(max-width: 200px) 100vw, 200px"
                    />
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onRemove();
                        }}
                        className="absolute top-1 right-1 bg-white/90 p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                        type="button"
                    >
                        <X className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center w-full min-h-30 border border-dashed border-gray-200 rounded cursor-pointer hover:border-purple-400 transition-colors gap-2 text-gray-400 hover:text-purple-600 bg-white">
                    {uploading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    ) : (
                        <>
                            <ImagePlus className="w-6 h-6" />
                            <span className="text-xs">Cliquez pour ajouter une photo</span>
                        </>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                </label>
            )}
        </div>
    );
}
