import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Clock3, Factory, HardHat, MapPin, Package, ShieldCheck, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/Reveal";
import { formatCents, formatDollars } from "@/lib/money";
import { getDisplayCurrency } from "@/lib/currency.server";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HubWeld | Industrial Welding Parts, Distribution & Fabrication Network",
  description: "HubWeld is the go-to platform for industrial welding parts distribution, job posting, and fabrication network. Distributors, brokers, and system integrators trust HubWeld to source parts fast.",
  keywords: [
    "HubWeld", "hub weld", "hubweld.ca", "hub weld platform", "hubweld network",
    "industrial welding parts", "welding distribution network", "welding parts search platform",
    "certified welding network", "welding job marketplace",
  ],
  alternates: { canonical: "/" },
};

const services = [
  {
    icon: Truck,
    title: "Mobile Welding Crews",
    text: "Dispatch vetted welders to plants, job sites, and emergency locations.",
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
  },
  {
    icon: Factory,
    title: "Fabrication Partners",
    text: "Source reliable shops for structural steel, custom assemblies, and production runs.",
    img: "https://images.unsplash.com/photo-1469289759076-d1484757abc3?w=600&q=80",
  },
  {
    icon: HardHat,
    title: "Certified Talent Network",
    text: "Find AWS, CWB, pipe, TIG, MIG, stainless, and aluminum specialists.",
    img: "https://images.unsplash.com/photo-1516216628859-9bccecab13ca?w=600&q=80",
  },
  {
    icon: Clock3,
    title: "Urgent Repair Response",
    text: "Reduce downtime with rapid support for breakdowns and field repairs.",
    img: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=600&q=80",
  },
];

const plate = [
  { value: "4.8 hr", label: "Avg. response" },
  { value: "24/7", label: "Urgent intake" },
  { value: "100%", label: "Skill-matched" },
  { value: "50+", label: "Metro areas" },
];

const industries = ["Construction", "Manufacturing", "Transportation", "Energy", "Agriculture", "Municipal", "Warehousing", "Food Processing"];

const faqs = [
  { q: "What is HubWeld?", a: "HubWeld is a welding and fabrication network connecting project owners with qualified welders, mobile welding crews, and fabrication shops." },
  { q: "Can HubWeld help with emergency welding repairs?", a: "Yes. HubWeld matches the job location, welding process, material, and timeline with available qualified professionals." },
  { q: "What services can customers request?", a: "Mobile welding, structural steel, pipe welding, equipment repair, stainless and aluminum welding, custom fabrication, and project-based welding labor." },
  { q: "Is HubWeld for welders or customers?", a: "Both. Customers post jobs and receive bids; welders join the network to receive job opportunities." },
];

function SectionHead({ title, href, hrefLabel }: { title: string; href?: string; hrefLabel?: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-4xl font-bold uppercase leading-none tracking-tight text-slate-900 md:text-5xl">{title}</h2>
        {href && (
          <Link href={href} className="group inline-flex shrink-0 items-center gap-1.5 pb-1 font-mono text-xs uppercase tracking-wider text-slate-600 transition-colors hover:text-brand-light">
            {hrefLabel ?? "View all"}
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      <div className="seam mt-4" aria-hidden />
    </div>
  );
}

export default async function HomePage() {
  const currency = getDisplayCurrency();
  const [latestProducts, latestJobs] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { category: true },
    }),
    prisma.job.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { _count: { select: { bids: true } } },
    }),
  ]);

  const latestPosts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { category: true },
  });
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "HubWeld",
    alternateName: ["Hub Weld", "HubWeld Platform"],
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/shop?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "HubWeld", item: SITE_URL },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ margin: "0 calc(-1 * (100vw - min(1180px, 100%)) / 2)" }}>
        <div className="relative w-full">
          <Image
            src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1800&q=85"
            alt="Professional welder at work with bright arc flash"
            fill
            priority
            className="object-cover object-center"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900/95 via-ink-900/70 to-ink-900/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-ink-900/40" />

          <div className="relative flex min-h-[600px] items-center md:min-h-[88vh]">
            <div className="mx-auto w-full max-w-[1180px] px-6 pb-24 pt-16 md:px-8 md:pb-28 md:pt-20">
              <div className="max-w-3xl">
                <h1 className="forge-rise font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight text-slate-900 md:text-8xl">
                  The welding network built for{" "}
                  <span className="text-brand-light">real-world deadlines</span>
                </h1>
                <p className="forge-rise-2 mt-6 max-w-[52ch] text-lg leading-relaxed text-slate-700">
                  Post jobs, receive bids from vetted welders and fabrication shops, and coordinate field work — all in one platform.
                </p>
                <div className="forge-rise-2 mt-9 flex flex-wrap gap-4">
                  <Link href="/jobs/new" className="btn-primary">
                    Post a Job <ArrowRight size={17} />
                  </Link>
                  <Link href="/register?role=WELDER" className="btn-secondary">
                    Join as a Welder
                  </Link>
                </div>
                <div className="forge-rise-3 mt-10 flex flex-wrap gap-x-7 gap-y-3 font-mono text-xs uppercase tracking-wider text-slate-600">
                  <span className="inline-flex items-center gap-2"><ShieldCheck size={14} className="text-brand-light" /> Credential-first matching</span>
                  <span className="inline-flex items-center gap-2"><MapPin size={14} className="text-brand-light" /> Local &amp; regional coverage</span>
                  <span className="inline-flex items-center gap-2"><BadgeCheck size={14} className="text-brand-light" /> AWS &amp; CWB certified</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1.5 hazard opacity-70" aria-hidden />
        </div>
      </section>

      {/* ── DATA PLATE ── */}
      <section aria-label="Network figures" className="relative z-10 -mt-10 md:-mt-12">
        <div className="clip-plate grid grid-cols-2 divide-y divide-slate-200 border border-slate-200 bg-ink-700 shadow-plate md:grid-cols-4 md:divide-x md:divide-y-0">
          {plate.map(({ value, label }) => (
            <div key={label} className="flex flex-col gap-1 px-7 py-6">
              <span className="font-display text-4xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</span>
              <span className="font-mono text-[11px] uppercase tracking-machine text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="pt-20">
        <Reveal>
        <SectionHead title="One platform. Every welding need." />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {services.map(({ icon: Icon, title, text, img }) => (
            <article key={title} className="group overflow-hidden rounded-sm border border-slate-200 bg-ink-700 shadow-plate-sm transition-colors duration-200 hover:border-brand/50">
              <div className="relative h-44 w-full overflow-hidden border-b border-slate-200">
                <Image
                  src={img}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-800/90 via-transparent to-transparent" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2.5">
                  <Icon size={17} className="shrink-0 text-brand-light" />
                  <h3 className="font-display text-xl font-bold uppercase tracking-wide text-slate-900">{title}</h3>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2.5">
          <span className="font-mono text-[11px] uppercase tracking-machine text-slate-500">Industries served</span>
          {industries.map((i) => (
            <span key={i} className="rounded-sm border border-slate-200 bg-ink-800 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-slate-600">
              {i}
            </span>
          ))}
        </div>
        </Reveal>
      </section>

      {/* ── FOR WELDERS ── */}
      <Reveal>
      <section className="relative mt-20 overflow-hidden rounded-sm border border-slate-200 shadow-plate">
        <div className="relative min-h-[320px] w-full">
          <Image
            src="https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1600&q=80"
            alt="Industrial fabrication shop"
            fill
            className="object-cover object-center"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900/95 via-ink-900/75 to-ink-900/30" />
          <div className="absolute inset-y-0 left-0 w-1.5 hazard" aria-hidden />
          <div className="relative flex min-h-[320px] items-center px-8 py-12 md:px-14">
            <div className="max-w-xl">
              <h2 className="font-display text-4xl font-bold uppercase leading-none tracking-tight text-slate-900 md:text-5xl">
                Grow your welding business. <span className="text-brand-light">Get paid to do what you do best.</span>
              </h2>
              <p className="mt-4 max-w-[48ch] leading-relaxed text-slate-700">
                Join the HubWeld network and receive job opportunities matched to your skills, location, and availability.
              </p>
              <Link href="/register?role=WELDER" className="btn-primary mt-7 inline-flex">
                Apply as a Welder <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      </Reveal>

      {/* ── LATEST PRODUCTS ── */}
      {latestProducts.length > 0 && (
        <section className="pt-20">
          <Reveal>
          <SectionHead title="Latest products" href="/shop" hrefLabel="Browse the shop" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {latestProducts.map((p) => (
              <Link key={p.id} href={`/shop/p/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-sm border border-slate-200 bg-ink-700 shadow-plate-sm transition-colors hover:border-brand/50">
                <div className="relative h-40 w-full overflow-hidden border-b border-slate-200 bg-ink-800">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center"><Package size={36} className="text-slate-300" /></div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-1.5 font-mono text-[10px] uppercase tracking-machine text-slate-500">{p.category.name}</div>
                  <h3 className="text-sm font-semibold leading-snug text-slate-900 transition-colors line-clamp-2 group-hover:text-brand-light">{p.name}</h3>
                  {p.brand && <div className="mt-1 text-xs text-slate-500">{p.brand}</div>}
                  <div className="mt-auto flex items-baseline justify-between pt-3">
                    <span className="font-display text-xl font-bold text-slate-900 tabular-nums">{formatCents(p.priceCents, currency)}</span>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500 tabular-nums">Stock {p.stock}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          </Reveal>
        </section>
      )}

      {/* ── LATEST JOBS ── */}
      {latestJobs.length > 0 && (
        <section className="pt-20">
          <Reveal>
          <SectionHead title="Open job postings" href="/jobs" hrefLabel="All jobs" />
          <div className="grid gap-3 md:grid-cols-2">
            {latestJobs.map((j) => (
              <Link key={j.id} href={`/jobs/${j.id}`}
                className="group flex items-center justify-between gap-4 rounded-sm border border-slate-200 bg-ink-700 px-5 py-4 shadow-plate-sm transition-colors hover:border-brand/50">
                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-2.5">
                    <span className="badge border border-green-500/30 bg-green-500/10 text-green-700">Open</span>
                    <span className="truncate font-mono text-[11px] uppercase tracking-wider text-slate-500">{j.category}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold uppercase tracking-wide text-slate-900 transition-colors line-clamp-1 group-hover:text-brand-light">{j.title}</h3>
                  <div className="mt-1.5 flex items-center gap-4 font-mono text-[11px] uppercase tracking-wider text-slate-500 tabular-nums">
                    <span className="flex items-center gap-1"><MapPin size={11} />{j.city}</span>
                    {j.budget ? <span>{formatDollars(j.budget)} budget</span> : null}
                    <span>{j._count.bids} bid{j._count.bids !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <ArrowRight size={16} className="shrink-0 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-brand-light" />
              </Link>
            ))}
          </div>
          </Reveal>
        </section>
      )}

      {/* ── LATEST BLOG POSTS ── */}
      {latestPosts.length > 0 && (
        <section className="pt-20">
          <Reveal>
          <SectionHead title="From the blog" href="/blog" hrefLabel="All articles" />
          <div className="grid gap-5 md:grid-cols-3">
            {latestPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-sm border border-slate-200 bg-ink-700 shadow-plate-sm transition-colors hover:border-brand/50">
                <div className="relative h-44 w-full overflow-hidden border-b border-slate-200 bg-ink-800">
                  {(post as any).coverImage ? (
                    <img src={(post as any).coverImage} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <path d="M62 16 L34 50 L47 50 L38 84 L66 50 L53 50 Z" fill="rgba(255,255,255,0.12)" />
                      </svg>
                    </div>
                  )}
                  {post.category && (
                    <span className="absolute bottom-3 left-3 rounded-sm border border-brand/40 bg-ink-900/85 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-machine text-brand-light">
                      {post.category.name}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-semibold leading-snug text-slate-900 transition-colors line-clamp-2 group-hover:text-brand-light">{post.title}</h3>
                  {post.excerpt && <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-2">{post.excerpt}</p>}
                  <div className="mt-auto flex items-center justify-between pt-4 font-mono text-[11px] uppercase tracking-wider text-slate-500">
                    <span>{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span className="inline-flex items-center gap-1 text-brand-light">Read <ArrowRight size={11} /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          </Reveal>
        </section>
      )}

      {/* ── FAQ ── */}
      <section className="pt-20">
        <Reveal>
        <SectionHead title="Common questions" />
        <div className="overflow-hidden rounded-sm border border-slate-200 bg-ink-700 shadow-plate-sm">
          {faqs.map((f, i) => (
            <details key={f.q} className={`group px-6 py-5 ${i > 0 ? "border-t border-slate-200" : ""}`}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-slate-900 transition-colors group-open:text-brand-light [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="shrink-0 font-mono text-lg leading-none text-slate-500 transition-transform group-open:rotate-45 group-open:text-brand-light">+</span>
              </summary>
              <p className="mt-3 max-w-[75ch] text-sm leading-relaxed text-slate-700">{f.a}</p>
            </details>
          ))}
        </div>
        </Reveal>
      </section>
    </>
  );
}
