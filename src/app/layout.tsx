import type { Metadata } from "next";
import Link from "next/link";
import { Barlow, Barlow_Condensed, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { getDisplayCurrency } from "@/lib/currency.server";
import { SITE_URL } from "@/lib/site";

const fontBody = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});
const fontDisplay = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});
const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "HubWeld | Industrial Welding Parts, Distribution & Fabrication Network",
    template: "%s | HubWeld",
  },
  description: "HubWeld is the industrial welding parts and fabrication network for distributors, brokers, dealers, and system integrators. Search millions of welding parts, post jobs, and connect with certified welders globally.",
  keywords: [
    "HubWeld", "hub weld", "hubweld platform", "hub weld network",
    "welding parts distributor", "industrial welding network", "welding parts search",
    "certified welders", "mobile welding", "welding contractors", "fabrication network",
    "industrial welding", "emergency welding repair", "welding parts RFQ",
    "obsolete welding parts", "surplus welding stock", "welding BOM",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "HubWeld | Industrial Welding Parts & Fabrication Network",
    description: "Search millions of welding parts, connect with distributors, brokers, and certified welders worldwide. HubWeld is the platform built for real-world welding deadlines.",
    url: `${SITE_URL}/`,
    siteName: "HubWeld",
    type: "website",
  },
  twitter: { card: "summary_large_image", site: "@hubweld" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const currency = getDisplayCurrency();
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HubWeld",
    alternateName: ["Hub Weld", "HubWeld Platform", "HubWeld Network"],
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/logo.png`,
    description: "HubWeld is an industrial welding parts and fabrication network connecting distributors, brokers, dealers, and system integrators with suppliers worldwide.",
    foundingDate: "2024",
    areaServed: ["United States", "Canada", "United Kingdom", "Australia", "Germany", "Netherlands", "UAE"],
    serviceType: [
      "Industrial Welding Parts Distribution",
      "Mobile Welding",
      "Certified Welding Staffing",
      "Emergency Weld Repair",
      "Obsolete Parts Sourcing",
      "Welding BOM Management",
      "Fabrication Network",
    ],
    sameAs: [
      "https://www.linkedin.com/company/hubweld",
      "https://twitter.com/hubweld",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: "English",
    },
  };
  const footerCols: { title: string; links: { label: string; href: string }[] }[] = [
    {
      title: "Platform",
      links: [
        { label: "Parts Shop", href: "/shop" },
        { label: "Job Board", href: "/jobs" },
        { label: "Welder Directory", href: "/directory" },
        { label: "Blog", href: "/blog" },
      ],
    },
    {
      title: "Solutions",
      links: [
        { label: "For Distributors", href: "/solutions/distributors" },
        { label: "For Brokers & Dealers", href: "/solutions/brokers" },
        { label: "For System Integrators", href: "/solutions/integrators" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Our Product", href: "/about/product" },
        { label: "Team", href: "/about/team" },
      ],
    },
    {
      title: "Get Started",
      links: [
        { label: "Post a Job", href: "/jobs/new" },
        { label: "Join as a Welder", href: "/register?role=WELDER" },
        { label: "Sell as a Supplier", href: "/register?role=SUPPLIER" },
        { label: "Sign In", href: "/login" },
      ],
    },
  ];

  return (
    <html lang="en" className={`${fontBody.variable} ${fontDisplay.variable} ${fontMono.variable}`}>
      <body className="font-sans antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
        <Providers>
          <Navbar currency={currency} />
          <main className="mx-auto w-[min(1180px,calc(100%-32px))]">{children}</main>
          <footer className="mt-24 bg-ink-800">
            <div className="seam-red seam" aria-hidden />
            <div className="mx-auto w-[min(1180px,calc(100%-32px))] py-14">
              <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
                <div>
                  <div className="flex items-center gap-2.5">
                    <svg width="30" height="30" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <rect width="100" height="100" fill="#D42B2B" />
                      <path d="M62 16 L34 50 L47 50 L38 84 L66 50 L53 50 Z" fill="white" />
                    </svg>
                    <span className="font-display text-xl font-bold uppercase tracking-machine text-slate-900">HubWeld</span>
                  </div>
                  <p className="mt-4 max-w-[26ch] text-sm leading-relaxed text-slate-600">
                    The industrial welding parts and fabrication network — built for real-world deadlines.
                  </p>
                </div>
                {footerCols.map((col) => (
                  <nav key={col.title} aria-label={col.title}>
                    <h3 className="font-mono text-[11px] font-semibold uppercase tracking-machine text-slate-500">{col.title}</h3>
                    <ul className="mt-4 space-y-2.5">
                      {col.links.map((l) => (
                        <li key={l.href}>
                          <Link href={l.href} className="text-sm text-slate-600 transition-colors hover:text-slate-900">
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                ))}
              </div>
            </div>
            <div className="border-t border-slate-200">
              <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] flex-wrap items-center justify-between gap-2 py-5 font-mono text-[11px] uppercase tracking-wider text-slate-500">
                <span>© {new Date().getFullYear()} HubWeld · Certified Welding &amp; Fabrication Network</span>
                <span className="hidden md:block">EST. 2024 · Serving US · CA · UK · EU · UAE</span>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
