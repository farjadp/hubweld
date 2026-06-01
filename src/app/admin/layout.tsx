"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Briefcase, Store, ShoppingBag, Package, ChevronRight, BookOpen } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/suppliers", label: "Suppliers", icon: Store },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/blog", label: "Blog", icon: BookOpen },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="flex min-h-[calc(100vh-80px)] gap-0">
      {/* Sidebar */}
      <aside className="sticky top-[72px] h-[calc(100vh-72px)] w-56 shrink-0 overflow-y-auto border-r border-white/10 bg-[#0d0f11] py-6">
        <div className="mb-6 px-5">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Admin Panel</span>
        </div>
        <nav className="flex flex-col gap-0.5 px-3">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? path === href : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-red-600/15 text-red-400 border border-red-600/20"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {label}
                {active && <ChevronRight size={13} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="min-w-0 flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
