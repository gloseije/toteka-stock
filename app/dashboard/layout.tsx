"use client";

import Sidebar from "@/components/sidebar";
import DashboardHeader from "@/components/dashboard-header";
import React, { useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="min-h-screen bg-purple-50/50 flex flex-col">
            <DashboardHeader onMenuClick={() => setIsOpen(true)} />
            <div className="flex flex-1">
                <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
                <main className="min-w-0 flex-1 overflow-x-hidden pt-14 lg:pt-10 lg:pl-64">
                    {children}
                </main>
            </div>
        </div>
    );
}
