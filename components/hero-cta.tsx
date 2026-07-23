"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function HeroCTA() {
    const { data: session } = authClient.useSession();

    return (
        <div className="flex flex-wrap gap-3 mt-8">
            <Link
                href={session ? "/dashboard" : "/register"}
                className="text-sm font-semibold bg-purple-700 text-white px-5 py-2.5 rounded hover:bg-purple-900 transition-colors"
            >
                {session ? "Accéder au tableau de bord" : "Commencer gratuitement"}
            </Link>
            <Link
                href="/features"
                className="text-sm font-semibold border border-white/30 text-white px-5 py-2.5 rounded hover:bg-white/10 transition-colors"
            >
                En savoir plus
            </Link>
        </div>
    );
}
