"use client";

import { LayoutGrid, Library, Users, BarChart3, Settings, LogOut, Bot } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminSidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/templates' && pathname?.startsWith('/templates')) return true;
        if (path === '/agents' && pathname?.startsWith('/agents')) return true;
        return pathname === path;
    };

    return (
        <div className="w-[240px] shrink-0 h-screen border-r border-[#1f2937] bg-[#0f131d] flex flex-col justify-between py-6">
            <div>
                {/* Logo & Portal Name */}
                <div className="flex items-center gap-3 px-6 mb-10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <div className="w-4 h-4 bg-[#0f131d] rounded-full" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold tracking-wide leading-tight">DevStudio</h1>
                        <p className="text-[#94a3b8] text-xs">Admin Portal</p>
                    </div>
                </div>

                {/* Main Navigation */}
                <nav className="flex flex-col gap-1 px-3">
                    <NavItem href="/" icon={<LayoutGrid size={18} />} label="Dashboard" active={isActive('/')} />
                    <NavItem href="/templates" icon={<Library size={18} />} label="Library" active={isActive('/templates')} />
                    <NavItem href="/agents" icon={<Bot size={18} />} label="Agents" active={isActive('/agents')} />
                    <NavItem href="#" icon={<Users size={18} />} label="Team" />
                    <NavItem href="#" icon={<BarChart3 size={18} />} label="Reports" />
                </nav>
            </div>

            {/* Bottom Navigation */}
            <div className="flex flex-col gap-1 px-3 mt-auto">
                <NavItem href="#" icon={<Settings size={18} />} label="Settings" />
                <NavItem href="#" icon={<LogOut size={18} />} label="Logout" />
            </div>
        </div>
    );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors w-full ${active
                ? "bg-[#2a364d] text-white"
                : "text-[#94a3b8] hover:text-white hover:bg-[#1b253c]/50"
                }`}
        >
            <span className={active ? "text-slate-200" : "text-slate-400"}>{icon}</span>
            {label}
        </Link>
    );
}
