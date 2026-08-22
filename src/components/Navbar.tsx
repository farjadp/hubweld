"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ShoppingCart, Store, Users, Cpu, LogOut, LayoutDashboard, ShoppingBag, Shield, Menu, X, Settings } from "lucide-react";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import type { Currency } from "@/lib/currency";

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
      className={`relative py-1 text-sm font-medium transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-brand-light after:transition-transform after:duration-200 hover:text-white hover:after:scale-x-100 ${active ? "text-white after:scale-x-100" : "text-slate-600"}`}
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

  useEffect(() => {
    setOpen(false);
  }, [path]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 py-1 text-sm font-medium transition-colors hover:text-slate-900 ${active || open ? "text-slate-900" : "text-slate-600"}`}
      >
        Solutions
        <ChevronDown size={13} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+16px)] z-50 w-72 overflow-hidden rounded-sm border border-slate-200 bg-ink-700 shadow-plate">
          <div className="p-2">
            {solutions.map(({ label, href, icon: Icon, desc }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start gap-3 rounded-sm px-4 py-3 transition-colors hover:bg-slate-100"
              >
                <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-brand/10 text-brand-light ring-1 ring-brand/25 transition-colors group-hover:bg-brand/20">
                  <Icon size={15} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">{label}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{desc}</div>
                </div>
              </Link>
            ))}
          </div>
          <div className="border-t border-slate-200 px-4 py-3">
            <span className="font-mono text-[10px] uppercase tracking-machine text-slate-500">Industrial Welding Platform</span>
          </div>
        </div>
      )}
    </div>
  );
}

const aboutLinks = [
  {
    label: "About Us",
    href: "/about",
    icon: Users,
    desc: "Discover our mission and vision",
  },
  {
    label: "Our Product",
    href: "/about/product",
    icon: Cpu,
    desc: "Explore the HubWeld platform features",
  },
  {
    label: "Team",
    href: "/about/team",
    icon: Shield,
    desc: "Meet our founders and leadership",
  },
];

function AboutMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();
  const active = path.startsWith("/about");

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 py-1 text-sm font-medium transition-colors hover:text-slate-900 ${active || open ? "text-slate-900" : "text-slate-600"}`}
      >
        Company
        <ChevronDown size={13} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+16px)] z-50 w-72 overflow-hidden rounded-sm border border-slate-200 bg-ink-700 shadow-plate">
          <div className="p-2">
            {aboutLinks.map(({ label, href, icon: Icon, desc }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start gap-3 rounded-sm px-4 py-3 transition-colors hover:bg-slate-100"
              >
                <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-brand/10 text-brand-light ring-1 ring-brand/25 transition-colors group-hover:bg-brand/20">
                  <Icon size={15} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">{label}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{desc}</div>
                </div>
              </Link>
            ))}
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

  const path = usePathname();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-sm border border-slate-200 bg-ink-700 pl-1 pr-3 py-1 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        <span className="grid h-7 w-7 place-items-center rounded-sm bg-brand text-xs font-bold text-white">{initials}</span>
        <span className="hidden max-w-[100px] truncate md:block">{name.split(" ")[0]}</span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-52 overflow-hidden rounded-sm border border-slate-200 bg-ink-700 shadow-plate">
          <div className="border-b border-slate-200 px-4 py-3">
            <div className="text-sm font-semibold text-slate-900">{name}</div>
            <div className="text-xs text-slate-400 capitalize">{role.toLowerCase()}</div>
          </div>
          <div className="p-2">
            <Link href="/dashboard" className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
              <LayoutDashboard size={14} /> Dashboard
            </Link>
            <Link href="/orders" className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
              <ShoppingBag size={14} /> Orders
            </Link>
            <Link href="/dashboard/account" className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
              <Settings size={14} /> Account settings
            </Link>
            {role === "ADMIN" && (
              <Link href="/admin" className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-brand-light transition-colors hover:bg-brand/10">
                <Shield size={14} /> Admin Panel
              </Link>
            )}
          </div>
          <div className="border-t border-slate-200 p-2">
            <button
              onClick={() => { setOpen(false); onSignOut(); }}
              className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar({ currency = "CAD" }: { currency?: Currency }) {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const name = session?.user?.name ?? "User";
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [path]);

  useEffect(() => {
    if (!session) { setCartCount(0); return; }
    fetch("/api/cart").then((r) => r.ok ? r.json() : null).then((d) => {
      if (d?.items) setCartCount(d.items.reduce((a: number, i: { quantity: number }) => a + i.quantity, 0));
    }).catch(() => {});
  }, [session]);

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-ink-900/95 backdrop-blur-sm">
        <div className="h-[2px] w-full bg-brand" aria-hidden />
        <div className="mx-auto flex h-14 w-full max-w-[1180px] items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <rect width="100" height="100" fill="#D42B2B"/>
              <path d="M62 16 L34 50 L47 50 L38 84 L66 50 L53 50 Z" fill="white"/>
            </svg>
            <span className="font-display text-lg font-bold uppercase tracking-machine text-slate-900">HubWeld</span>
          </Link>

          {/* Center nav */}
          <nav className="hidden items-center gap-7 md:flex">
            <SolutionsMenu />
            <AboutMenu />
            <NavLink href="/blog">Blog</NavLink>
            <NavLink href="/shop">Shop</NavLink>
            <NavLink href="/jobs">Jobs</NavLink>
            <NavLink href="/directory">Welders</NavLink>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <CurrencySwitcher current={currency} />

            {/* Cart */}
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative grid h-9 w-9 place-items-center rounded-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-sm bg-brand px-1 font-mono text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {session ? (
              <UserMenu name={name} role={role ?? "CUSTOMER"} onSignOut={() => signOut({ callbackUrl: "/" })} />
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link href="/login" className="px-4 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
                  Login
                </Link>
                <Link href="/register" className="bg-brand px-4 py-2 font-display text-sm font-bold uppercase tracking-machine text-white shadow-ember transition-colors hover:bg-brand-light">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile burger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-slate-200 bg-ink-800 px-6 pb-5 pt-4 md:hidden">
            <div className="flex flex-col gap-1">
              {solutions.map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href} className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                  <Icon size={15} className="text-brand-light" /> {label}
                </Link>
              ))}
              <div className="my-1 h-px bg-slate-100" />
              {aboutLinks.map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href} className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                  <Icon size={15} className="text-brand-light" /> {label}
                </Link>
              ))}
              <div className="my-1 h-px bg-slate-100" />
              {[{ href: "/blog", label: "Blog" }, { href: "/shop", label: "Shop" }, { href: "/jobs", label: "Jobs" }, { href: "/directory", label: "Welders" }].map(({ href, label }) => (
                <Link key={href} href={href} className="rounded-sm px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                  {label}
                </Link>
              ))}
              {!session && (
                <>
                  <div className="my-1 h-px bg-slate-100" />
                  <Link href="/login" className="rounded-sm px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900">Login</Link>
                  <Link href="/register" className="bg-brand px-3 py-2.5 text-center font-display text-sm font-bold uppercase tracking-machine text-white">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
