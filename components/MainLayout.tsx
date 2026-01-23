"use client";

import { CircularSidebar } from "./CircularSidebar";
import { usePathname } from "next/navigation";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isMobileApp = pathname.startsWith("/order");

    if (isMobileApp) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-full w-full bg-pos-bg overflow-hidden relative">
            <CircularSidebar />
            <main className="flex-1 h-full overflow-hidden w-full pl-2">
                {children}
            </main>
        </div>
    );
}
