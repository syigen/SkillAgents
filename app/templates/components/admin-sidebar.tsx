import { LayoutGrid, Library, Users, BarChart3, Settings, LogOut } from "lucide-react";

export function AdminSidebar() {
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
                    <NavItem icon={<LayoutGrid size={18} />} label="Dashboard" />
                    <NavItem icon={<Library size={18} />} label="Library" active />
                    <NavItem icon={<Users size={18} />} label="Team" />
                    <NavItem icon={<BarChart3 size={18} />} label="Reports" />
                </nav>
            </div>

            {/* Bottom Navigation */}
            <div className="flex flex-col gap-1 px-3 mt-auto">
                <NavItem icon={<Settings size={18} />} label="Settings" />
                <NavItem icon={<LogOut size={18} />} label="Logout" />
            </div>
        </div>
    );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
    return (
        <button
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors w-full ${active
                    ? "bg-[#2a364d] text-white"
                    : "text-[#94a3b8] hover:text-white hover:bg-[#1b253c]/50"
                }`}
        >
            <span className={active ? "text-slate-200" : "text-slate-400"}>{icon}</span>
            {label}
        </button>
    );
}
