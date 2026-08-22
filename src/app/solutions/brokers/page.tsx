import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search, BarChart2, Zap, Package } from "lucide-react";

export const metadata: Metadata = {
  title: "For Brokers & Dealers | HubWeld – Source Hard-to-Find Welding Parts Fast",
  description: "HubWeld gives welding parts brokers and dealers instant access to millions of parts in stock — including obsolete and discontinued items. Real-time availability, emergency sourcing, global suppliers.",
  keywords: [
    "welding parts broker", "industrial welding dealer", "hard-to-find welding parts",
    "obsolete welding parts sourcing", "emergency welding parts", "welding parts stock availability",
    "MIG TIG welding parts broker USA", "welding components dealer Canada",
    "industrial parts availability", "welding parts on order", "surplus stock broker",
    "welding part number search",
  ],
  alternates: { canonical: "/solutions/brokers" },
  openGraph: {
    title: "For Brokers & Dealers | HubWeld – Find Any Welding Part in Seconds",
    description: "Search millions of welding parts from hundreds of global warehouses. Real-time stock data, emergency sourcing, obsolete parts — all on one platform.",
    url: "https://www.hubweld.com/solutions/brokers",
    siteName: "HubWeld",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const features = [
  {
    icon: Search,
    tag: "Obsolete Parts",
    title: "Obsolete part, discontinued production.",
    body: "Do you specialize in locating hard-to-find parts? We will help you speed up the search. We are connected to hundreds of warehouses with industrial welding parts so you can search millions of products available from stock (including obsolete ones) – in seconds! Try us with your next project and never look back.",
    cta: { label: "Search Parts Now", href: "/shop" },
    img: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=900&q=80",
    imgAlt: "Welding consumables and industrial parts organized on workshop shelves",
    reverse: false,
  },
  {
    icon: BarChart2,
    tag: "Stock Availability",
    title: "Availability problems – we can show you who currently has what in stock.",
    body: "On HubWeld you will always see on the top of your searches parts available in stock. Additionally, at the bottom of the search results screen, you will also see parts that are available on order. If the supplier has provided the information, you will also be able to see the lead time for these parts. When it comes to the parts in stock, companies performing well on availability criteria are ranked higher over time.",
    cta: { label: "Browse Stock", href: "/shop" },
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900&q=80",
    imgAlt: "Welding distributor checking industrial inventory availability",
    reverse: true,
  },
  {
    icon: Zap,
    tag: "Emergency",
    title: "Emergency replacements.",
    body: "Don't forget – time is money! Especially in breakdown situations. Delivery from the manufacturer might be days or even weeks. HubWeld allows you to search through thousands of parts from welding companies all over the world. The part you desperately need might be closer than you think… all you need to do is search for it!",
    cta: { label: "Find Parts Fast", href: "/shop" },
    img: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=900&q=80",
    imgAlt: "Emergency welding repair with bright arc flash in progress",
    reverse: false,
  },
  {
    icon: Package,
    tag: "No Stock? No Problem",
    title: "No parts in stock? No problem.",
    body: "If you do not carry any stock and you order parts once you land an order with your customer, then we could be an ideal tool for your business model. By having access to millions of products from hundreds of component suppliers carrying surplus stock, you can see real-time availability data for a specific part with ease. No need to carry stock, just order when it's needed. Find all the industrial welding components you need, directly from the companies that have them in stock. All in one place, in seconds!",
    cta: { label: "Start Sourcing", href: "/register" },
    img: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=900&q=80",
    imgAlt: "Modern welding fabrication workshop with industrial equipment",
    reverse: true,
  },
];

const stats = [
  { value: "Millions", label: "Parts Searchable" },
  { value: "100s", label: "Warehouses Connected" },
  { value: "Seconds", label: "Search Time" },
  { value: "Global", label: "Supplier Network" },
];

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can welding parts brokers find obsolete or discontinued parts on HubWeld?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. HubWeld is connected to hundreds of warehouses worldwide carrying millions of welding parts including obsolete and discontinued items, searchable by part number in seconds." },
    },
    {
      "@type": "Question",
      name: "How does HubWeld show real-time stock availability for welding parts?",
      acceptedAnswer: { "@type": "Answer", text: "Parts available in stock appear at the top of search results. Parts available on order appear below, along with lead time data if provided by the supplier. Suppliers with strong availability are ranked higher over time." },
    },
    {
      "@type": "Question",
      name: "Can I use HubWeld for emergency welding part replacements?",
      acceptedAnswer: { "@type": "Answer", text: "Absolutely. HubWeld lets you search thousands of parts from welding companies globally. In breakdown situations, the part you need is often available from a nearby supplier — reducing downtime significantly." },
    },
    {
      "@type": "Question",
      name: "Do I need to carry stock to use HubWeld as a dealer?",
      acceptedAnswer: { "@type": "Answer", text: "No. HubWeld is ideal for dealers who order on demand. You get real-time access to stock from hundreds of suppliers, so you can confirm availability before taking an order from your customer." },
    },
  ],
};

const serviceAreaLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "HubWeld Broker & Dealer Network",
  provider: { "@type": "Organization", name: "HubWeld", url: "https://www.hubweld.com" },
  description: "Industrial welding parts sourcing platform for brokers and dealers with real-time stock visibility across hundreds of global warehouses.",
  areaServed: ["United States", "Canada", "United Kingdom", "Australia", "Germany", "Netherlands"],
  serviceType: ["Welding Parts Brokerage", "Emergency Parts Sourcing", "Obsolete Parts Locating", "Stock Availability Search"],
};

export default function BrokersPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceAreaLd) }} />
      {/* ── HERO ── */}
      <section className="relative overflow-hidden rounded-2xl">
        <div className="relative h-[52vh] min-h-[380px] w-full">
          <Image
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&q=80"
            alt="Broker searching for industrial parts"
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
                For <span className="text-brand">Brokers / Dealers</span>
              </h1>
              <p className="mt-4 max-w-lg text-lg text-slate-700">
                Easily access more parts in stock. Search millions of industrial welding components from hundreds of suppliers — in seconds.
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

      {/* ── STATS BAR ── */}
      <section className="my-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-100 md:grid-cols-4">
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
            src="https://images.unsplash.com/photo-1553413077-190dd305871c?w=1600&q=80"
            alt="Parts warehouse"
            fill
            className="object-cover object-center"
            unoptimized
          />
          <div className="absolute inset-0 bg-ink-900/80" />
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div>
              <h2 className="text-2xl font-black text-slate-900 md:text-4xl">
                The part you need is closer than you think.
              </h2>
              <p className="mt-2 text-slate-600">Search millions of welding components from global suppliers — right now.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link href="/shop" className="btn-primary">Search Parts <ArrowRight size={16} /></Link>
                <Link href="/register" className="btn-secondary">Create Free Account</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
