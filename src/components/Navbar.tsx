"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ShoppingCart, Store, Users, Cpu, LogOut, LayoutDashboard, ShoppingBag, Shield, Menu, X } from "lucide-react";

const solutions = [
  {
    label: "For Distributors",
    href: "/solutions/distributors",
    icon: Store,
    desc: "Sell surplus stock & reach global buyers",
  },
  {
    label: "For Brokers / Dealers",
    href: "/solutions/brokers",
    icon: Users,
    desc: "Source hard-to-find parts in seconds",
  },
  {
    label: "For System Integrators",
    href: "/solutions/integrators",
    icon: Cpu,
    desc: "BOM upload, emergency parts & global suppliers",
  },
];

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const path = usePathname();
  const active = path === href;
  return (
    <Link
      href={href}
      className={`relative py-1 text-sm font-medium transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-red-500 after:transition-transform after:duration-200 hover:text-white hover:after:scale-x-100 ${active ? "text-white after:scale-x-100" : "text-white/50"}`}
    >
      {children}
    </Link>
  );
}

function SolutionsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();
  const active = path.startsWith("/solutions");

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 py-1 text-sm font-medium transition-colors hover:text-white ${active || open ? "text-white" : "text-white/50"}`}
      >
        Solutions
        <ChevronDown size={13} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+16px)] z-50 w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1113] shadow-2xl shadow-black/70 ring-1 ring-white/5">
          <div className="p-2">
            {solutions.map(({ label, href, icon: Icon, desc }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="group flex items-start gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-white/5"
              >
                <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-red-600/10 text-red-400 ring-1 ring-red-600/20 transition-colors group-hover:bg-red-600/20">
                  <Icon size={15} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white/90 group-hover:text-white">{label}</div>
                  <div className="mt-0.5 text-xs text-white/40">{desc}</div>
                </div>
              </Link>
            ))}
          </div>
          <div className="border-t border-white/5 px-4 py-3">
            <span className="text-xs text-white/25">Industrial Welding Platform</span>
          </div>
        </div>
      )}
    </div>
  );
}

function UserMenu({ name, role, onSignOut }: { name: string; role: string; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-1 pr-3 py-1 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-red-600 text-xs font-black text-white">{initials}</span>
        <span className="hidden max-w-[100px] truncate md:block">{name.split(" ")[0]}</span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1113] shadow-2xl shadow-black/70 ring-1 ring-white/5">
          <div className="border-b border-white/5 px-4 py-3">
            <div className="text-sm font-semibold text-white">{name}</div>
            <div className="text-xs text-white/30 capitalize">{role.toLowerCase()}</div>
          </div>
          <div className="p-2">
            <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white">
              <LayoutDashboard size={14} /> Dashboard
            </Link>
            <Link href="/orders" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white">
              <ShoppingBag size={14} /> Orders
            </Link>
            {role === "ADMIN" && (
              <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-600/10">
                <Shield size={14} /> Admin Panel
              </Link>
            )}
          </div>
          <div className="border-t border-white/5 p-2">
            <button
              onClick={() => { setOpen(false); onSignOut(); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/40 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const name = session?.user?.name ?? "User";
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!session) { setCartCount(0); return; }
    fetch("/api/cart").then((r) => r.ok ? r.json() : null).then((d) => {
      if (d?.items) setCartCount(d.items.reduce((a: number, i: { quantity: number }) => a + i.quantity, 0));
    }).catch(() => {});
  }, [session]);

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-white/[0.06] bg-[#0a0c0e]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-[1180px] items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="30" height="30" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="50" fill="#D42B2B"/>
              <path d="M62 16 L34 50 L47 50 L38 84 L66 50 L53 50 Z" fill="white"/>
            </svg>
            <span className="text-[15px] font-black tracking-tight text-white">HubWeld</span>
          </Link>

          {/* Center nav */}
          <nav className="hidden items-center gap-7 md:flex">
            <SolutionsMenu />
            <NavLink href="/blog">Blog</NavLink>
            <NavLink href="/shop">Shop</NavLink>
            <NavLink href="/jobs">Jobs</NavLink>
            <NavLink href="/directory">Welders</NavLink>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative grid h-9 w-9 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/5 hover:text-white"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {session ? (
              <UserMenu name={name} role={role ?? "CUSTOMER"} onSignOut={() => signOut({ callbackUrl: "/" })} />
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link href="/login" className="rounded-lg px-4 py-1.5 text-sm font-medium text-white/60 transition-colors hover:text-white">
                  Login
                </Link>
                <Link href="/register" className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile burger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/5 hover:text-white md:hidden"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-white/5 bg-[#0a0c0e] px-6 pb-5 pt-4 md:hidden">
            <div className="flex flex-col gap-1">
              {solutions.map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white">
                  <Icon size={15} className="text-red-400" /> {label}
                </Link>
              ))}
              <div className="my-1 h-px bg-white/5" />
              {[{ href: "/blog", label: "Blog" }, { href: "/shop", label: "Shop" }, { href: "/jobs", label: "Jobs" }, { href: "/directory", label: "Welders" }].map(({ href, label }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white">
                  {label}
                </Link>
              ))}
              {!session && (
                <>
                  <div className="my-1 h-px bg-white/5" />
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white">Login</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="rounded-xl bg-red-600 px-3 py-2.5 text-sm font-semibold text-white text-center">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
