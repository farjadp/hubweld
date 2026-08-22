import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap, Search, Archive, FileSpreadsheet, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "For System Integrators | HubWeld – Industrial Welding Parts & BOM Sourcing",
  description: "HubWeld helps system integrators source welding parts fast — emergency replacements, obsolete components, surplus stock, BOM upload, and global supplier search. Always have a Plan B.",
  keywords: [
    "system integrator welding parts", "welding BOM sourcing", "industrial welding components",
    "emergency welding parts replacement", "obsolete welding components", "surplus welding parts",
    "bill of materials welding", "CSV BOM upload welding", "welding parts RFQ system integrator",
    "international welding supplier", "welding parts USA", "welding parts Canada",
    "find local welding suppliers", "welding parts abroad", "industrial automation welding",
  ],
  alternates: { canonical: "/solutions/integrators" },
  openGraph: {
    title: "For System Integrators | HubWeld – Always Have a Plan B for Welding Parts",
    description: "Upload your BOM, search for emergency replacements, source obsolete parts, and find local suppliers worldwide — all from one platform built for system integrators.",
    url: "https://www.hubweld.com/solutions/integrators",
    siteName: "HubWeld",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const features = [
  {
    icon: Zap,
    tag: "Emergency",
    title: "Emergency replacements.",
    body: "Don't forget – time is money! Especially in breakdown situations. Delivery from the manufacturer might be days or even weeks. HubWeld allows you to search through thousands of parts from welding companies all over the world. The part you desperately need might be closer than you think…",
    cta: { label: "Find Parts Fast", href: "/shop" },
    img: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=900&q=80",
    imgAlt: "Industrial welder performing emergency repair with bright arc flash",
    reverse: false,
  },
  {
    icon: Search,
    tag: "Obsolete Parts",
    title: "Obsolete part, discontinued production.",
    body: "From time to time you get a request from a customer for a part that is no longer in production. You then search in your own stock or stock of your partners or you go directly to a manufacturer for a replacement… If all this still doesn't work – try us. We are connected to hundreds of warehouses with industrial welding parts so you can search millions of products available from stock (including obsolete ones) – in seconds!",
    cta: { label: "Search Obsolete Stock", href: "/shop" },
    img: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=900&q=80",
    imgAlt: "Welding electrodes and industrial parts organized on workshop shelves",
    reverse: true,
  },
  {
    icon: Archive,
    tag: "Surplus Stock",
    title: "Surplus stock, leftover from previous projects.",
    body: "Some parts are only available to buy in bulk, even when you just need one part for your project… With HubWeld you can easily find and buy this part from one of the hundreds of companies sharing their stock on our platform. You can also sell surplus stock that you have leftover from previous projects. Our platform allows you to share information about parts you no longer need with companies worldwide.",
    cta: { label: "Buy or Sell Surplus", href: "/shop" },
    img: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=900&q=80",
    imgAlt: "Surplus welding wire spools and industrial components in warehouse",
    reverse: false,
  },
  {
    icon: FileSpreadsheet,
    tag: "Bill of Materials",
    title: "Bill of materials – managed from one place.",
    body: "You have just completed a technical drawing of a new system for your customer, now you need to order parts… sending emails to many component suppliers can take long hours. On HubWeld you have the ability to upload a CSV file with your BOM and instantly check who has the part available in stock or 'on order' (and what is the lead time!). From there you can simply click 'inquire' and all the distributors receive your RFQs for the components you need.",
    cta: { label: "Upload Your BOM", href: "/register" },
    img: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=900&q=80",
    imgAlt: "Welding engineer reviewing technical blueprints in industrial facility",
    reverse: true,
  },
  {
    icon: MapPin,
    tag: "Global Projects",
    title: "Doing a project abroad? Find the nearest suppliers.",
    body: "When you are implementing a project for your international client in another country, it can be difficult to quickly import the product you need from your country. You can find distributors from all over the world on HubWeld — simply key in the part number and see who has it in stock and can deliver it quickly to the site.",
    cta: { label: "Find Local Suppliers", href: "/directory" },
    img: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=900&q=80",
    imgAlt: "Global welding distribution network and industrial logistics",
    reverse: false,
  },
];

const stats = [
  { value: "Plan B", label: "Always Ready" },
  { value: "CSV", label: "BOM Upload" },
  { value: "Global", label: "Supplier Network" },
  { value: "Seconds", label: "Search Time" },
];

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can system integrators upload a bill of materials (BOM) to HubWeld?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. HubWeld supports CSV BOM uploads. Once uploaded, you can instantly see which suppliers have each part in stock or on order, along with lead times, and send RFQs to all relevant distributors in one click." },
    },
    {
      "@type": "Question",
      name: "How does HubWeld help with emergency welding part replacements?",
      acceptedAnswer: { "@type": "Answer", text: "HubWeld connects you to thousands of welding parts from companies worldwide. In breakdown situations where manufacturer delivery may take days or weeks, a nearby supplier on HubWeld may have the part in stock and ready to ship." },
    },
    {
      "@type": "Question",
      name: "Can I find welding suppliers near an international project site?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. HubWeld lists distributors from all over the world. Simply search by part number and filter by location to find who has it in stock and can deliver quickly to your project site — regardless of country." },
    },
    {
      "@type": "Question",
      name: "Can system integrators buy and sell surplus welding parts on HubWeld?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. You can purchase single units from bulk surplus stock listed by other companies, and list your own leftover project parts for sale to other industrial welding businesses worldwide." },
    },
    {
      "@type": "Question",
      name: "Does HubWeld carry obsolete or discontinued welding components?",
      acceptedAnswer: { "@type": "Answer", text: "HubWeld is connected to hundreds of warehouses worldwide, many of which carry obsolete and discontinued welding parts. Search by part number and find results in seconds." },
    },
  ],
};

const serviceAreaLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "HubWeld System Integrator Solutions",
  provider: { "@type": "Organization", name: "HubWeld", url: "https://www.hubweld.com" },
  description: "Industrial welding parts sourcing platform for system integrators — BOM management, emergency sourcing, surplus stock, and global supplier search.",
  areaServed: ["United States", "Canada", "United Kingdom", "Australia", "Germany", "Netherlands", "UAE"],
  serviceType: ["BOM Parts Sourcing", "Emergency Welding Parts", "Surplus Stock Trading", "Obsolete Parts Search", "International Supplier Lookup"],
};

export default function IntegratorsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceAreaLd) }} />
      {/* ── HERO ── */}
      <section className="relative overflow-hidden rounded-2xl">
        <div className="relative h-[52vh] min-h-[380px] w-full">
          <Image
            src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&q=80"
            alt="Professional welder at work in industrial fabrication facility"
            fill
            priority
            className="object-cover object-center"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900/95 via-ink-900/70 to-ink-900/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center px-10 md:px-16">
            <div className="max-w-2xl">
              <span className="section-label mb-4 block">Solutions</span>
              <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 md:text-6xl">
                For <span className="text-brand">System Integrators</span>
              </h1>
              <p className="mt-4 max-w-lg text-lg text-slate-700">
                Always have plan B when searching for products. Concrete business solutions built around the way you work.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/shop" className="btn-primary">
                  Search Parts <ArrowRight size={18} />
                </Link>
                <Link href="/register" className="btn-secondary">
                  Join the Network
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTRO BAND ── */}
      <section className="my-6 rounded-xl border border-slate-200 bg-white px-8 py-7 md:px-12">
        <p className="max-w-3xl text-base leading-relaxed text-slate-600">
          We work with many system integrators for industrial welding and we are familiar with the way you operate your business. We have developed very concrete business solutions to help you with your day-to-day tasks:
        </p>
      </section>

      {/* ── STATS BAR ── */}
      <section className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-100 md:grid-cols-4">
        {stats.map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center gap-1 bg-white px-6 py-5 text-center">
            <span className="text-2xl font-black text-brand">{value}</span>
            <span className="text-xs uppercase tracking-widest text-slate-500">{label}</span>
          </div>
        ))}
      </section>

      {/* ── FEATURES ── */}
      <div className="space-y-6">
        {features.map(({ icon: Icon, tag, title, body, cta, img, imgAlt, reverse }) => (
          <section
            key={tag}
            className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white md:flex-row ${reverse ? "md:flex-row-reverse" : ""}`}
          >
            {/* Image */}
            <div className="relative min-h-[260px] w-full shrink-0 md:w-[45%]">
              <Image
                src={img}
                alt={imgAlt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                unoptimized
              />
              <div className={`absolute inset-0 ${reverse ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-transparent to-[#111315]/60`} />
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center gap-4 px-8 py-10 md:px-12">
              <div className="inline-flex w-fit items-center gap-2 rounded border border-red-600/30 bg-red-600/10 px-3 py-1">
                <Icon size={13} className="text-brand" />
                <span className="text-xs font-black uppercase tracking-widest text-brand">{tag}</span>
              </div>
              <h2 className="text-2xl font-black leading-snug tracking-tight text-slate-900 md:text-3xl">{title}</h2>
              <p className="max-w-lg text-sm leading-relaxed text-slate-600">{body}</p>
              <Link
                href={cta.href}
                className="mt-2 inline-flex w-fit items-center gap-2 text-sm font-bold text-brand transition-colors hover:text-brand-light"
              >
                {cta.label} <ArrowRight size={15} />
              </Link>
            </div>
          </section>
        ))}
      </div>

      {/* ── CTA FOOTER ── */}
      <section className="relative my-8 overflow-hidden rounded-2xl">
        <div className="relative h-56 w-full">
          <Image
            src="https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1600&q=80"
            alt="Industrial welding and fabrication workshop"
            fill
            className="object-cover object-center"
            unoptimized
          />
          <div className="absolute inset-0 bg-ink-900/80" />
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div>
              <h2 className="text-2xl font-black text-slate-900 md:text-4xl">
                Always have a Plan B.
              </h2>
              <p className="mt-2 text-slate-600">
                Search millions of welding parts from global suppliers — and never get stuck on a project again.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link href="/register" className="btn-primary">Create Free Account <ArrowRight size={16} /></Link>
                <Link href="/shop" className="btn-secondary">Browse Parts</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
