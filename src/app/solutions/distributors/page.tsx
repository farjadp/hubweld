import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Globe, Search, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "For Distributors | HubWeld – Industrial Welding Parts Distribution Network",
  description: "HubWeld helps welding parts distributors sell surplus stock, reduce lead times, reach new buyers, and list obsolete parts globally. Join hundreds of distributors on our platform.",
  keywords: [
    "welding parts distributor", "industrial welding distribution", "surplus welding stock",
    "obsolete welding parts", "welding parts RFQ", "MIG TIG welding consumables distributor",
    "welding supply distributor USA", "welding parts Canada", "industrial parts network",
    "welding distribution platform", "sell surplus welding parts", "welding parts lead time",
  ],
  alternates: { canonical: "/solutions/distributors" },
  openGraph: {
    title: "For Distributors | HubWeld – Sell Surplus, Reduce Lead Times, Reach Global Buyers",
    description: "List your welding parts stock on HubWeld and connect with buyers across the US, Canada, and worldwide. Fast RFQ, real-time availability, new sales channels.",
    url: "https://www.hubweld.com/solutions/distributors",
    siteName: "HubWeld",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const features = [
  {
    icon: Clock,
    tag: "Lead Time",
    title: "Long lead time is now shorter.",
    body: "You need to get the parts fast and the manufacturer has quoted you with a 12 week lead time?! No worries, we are here to help you. We are connected with hundreds of distributors and their stock data is available on our platform. Try to type the part number and send RFQ directly from HubWeld – it's quick and easy!",
    cta: { label: "Search Parts", href: "/shop" },
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900&q=80",
    imgAlt: "Welding distributor warehouse with inventory management",
    reverse: false,
  },
  {
    icon: Globe,
    tag: "E-Commerce",
    title: "Need to increase traffic to your Webshop?",
    body: "You have invested in a webshop to make it easier to sell your products and get new clients – that's great! We can also help you grow your e-business! Being part of HubWeld gives you access to features that will link part searches directly to your e-shop, creating an easier purchase experience for other HubWeld members. Our businesses can grow together!",
    cta: { label: "Join the Network", href: "/register" },
    img: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=900&q=80",
    imgAlt: "Welding supplies e-commerce platform and digital distribution",
    reverse: true,
  },
  {
    icon: Search,
    tag: "Obsolete Parts",
    title: "Obsolete part, discontinued production.",
    body: "From time to time you get a request from a customer for a part that is no longer in production. You then search in your own stock or stock of your partners or you go directly to a manufacturer for a replacement… If all this still doesn't work – try us. We are connected to hundreds of warehouses with industrial welding parts so you can search millions of products available from stock (including obsolete ones) – in seconds!",
    cta: { label: "Search Stock", href: "/shop" },
    img: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=900&q=80",
    imgAlt: "Welding parts warehouse with spools electrodes and consumables",
    reverse: false,
  },
  {
    icon: TrendingUp,
    tag: "Visibility",
    title: "Create additional sales channels and increase your visibility.",
    body: "Promote your company in our Business Directory catalogue and the internal website of HubWeld. Share your stock on the platform and make it available to search by hundreds of distributors, brokers and system integrators worldwide. These are great new sales channels that we can help you with!",
    cta: { label: "List Your Business", href: "/directory" },
    img: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=900&q=80",
    imgAlt: "Welding distribution business growth and supplier network expansion",
    reverse: true,
  },
];

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How can HubWeld help welding parts distributors reduce lead times?",
      acceptedAnswer: { "@type": "Answer", text: "HubWeld connects you to hundreds of distributors with real-time stock data. You can search by part number and send an RFQ directly from the platform — cutting weeks of lead time down to minutes." },
    },
    {
      "@type": "Question",
      name: "Can I sell obsolete or surplus welding parts on HubWeld?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. HubWeld allows distributors to list surplus and discontinued welding parts, making them searchable by buyers across the US, Canada, and globally." },
    },
    {
      "@type": "Question",
      name: "How does HubWeld help distributors increase e-commerce traffic?",
      acceptedAnswer: { "@type": "Answer", text: "By joining HubWeld, part searches on our platform can link directly to your webshop, driving qualified industrial buyers to your existing e-commerce storefront." },
    },
    {
      "@type": "Question",
      name: "What regions does HubWeld serve for welding parts distribution?",
      acceptedAnswer: { "@type": "Answer", text: "HubWeld serves distributors and buyers across the United States, Canada, and internationally, with hundreds of warehouses and suppliers listed on the platform." },
    },
  ],
};

const serviceAreaLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "HubWeld Distributor Network",
  provider: { "@type": "Organization", name: "HubWeld", url: "https://www.hubweld.com" },
  description: "Industrial welding parts distribution platform connecting distributors with buyers across North America and worldwide.",
  areaServed: ["United States", "Canada", "United Kingdom", "Australia"],
  serviceType: ["Welding Parts Distribution", "Surplus Stock Listing", "Obsolete Parts Sourcing", "RFQ Management"],
};

export default function DistributorsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceAreaLd) }} />
      {/* ── HERO ── */}
      <section className="relative overflow-hidden rounded-2xl">
        <div className="relative h-[52vh] min-h-[380px] w-full">
          <Image
            src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&q=80"
            alt="Industrial welding distribution"
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
                For <span className="text-brand">Distributors</span>
              </h1>
              <p className="mt-4 max-w-lg text-lg text-slate-700">
                Sell your surplus, non-rotating stock and connect with new partners globally.
              </p>
              <Link href="/register" className="btn-primary mt-7 inline-flex">
                Get Started <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <div className="mt-6 space-y-6">
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
            src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1600&q=80"
            alt="Industrial facility"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-ink-900/80" />
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div>
              <h2 className="text-2xl font-black text-slate-900 md:text-4xl">Ready to grow your distribution business?</h2>
              <p className="mt-2 text-slate-600">Join hundreds of distributors already on the HubWeld network.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link href="/register" className="btn-primary">Create Account <ArrowRight size={16} /></Link>
                <Link href="/shop" className="btn-secondary">Browse Parts</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
