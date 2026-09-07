"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

interface AuthLinkProps {
    href: string;
    className: string;
    children: React.ReactNode;
    authenticatedText?: string;
    authenticatedHref?: string;
    showButton?: boolean;
}

/**
 * A link component that changes its destination and text based on user authentication.
 */
export default function AuthLink({ 
    href, 
    className, 
    children, 
    authenticatedText = "Tableau de bord",
    authenticatedHref = "/dashboard",
    showButton = true,
}: AuthLinkProps) {
    const { data: session } = authClient.useSession();

    if (!showButton) return null;

    return (
        <Link href={session ? authenticatedHref : href} className={className}>
            {session ? authenticatedText : children}
        </Link>
    );
}
