import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.hubweld.com"),
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
    url: "https://www.hubweld.com/",
    siteName: "HubWeld",
    type: "website",
  },
  twitter: { card: "summary_large_image", site: "@hubweld" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HubWeld",
    alternateName: ["Hub Weld", "HubWeld Platform", "HubWeld Network"],
    url: "https://www.hubweld.com/",
    logo: "https://www.hubweld.com/logo.png",
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
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
        <Providers>
          <Navbar />
          <main className="mx-auto w-[min(1180px,calc(100%-32px))]">{children}</main>
          <footer className="mt-20 border-t border-white/10 bg-[#0a0c0e]">
            <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] items-center justify-between py-8 text-sm text-white/30">
              <span>© {new Date().getFullYear()} HubWeld · Certified Welding &amp; Fabrication Network</span>
              <span className="hidden md:block">Built for real-world deadlines.</span>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
