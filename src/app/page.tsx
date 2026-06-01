import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Clock3, Factory, HardHat, MapPin, ShieldCheck, Truck, Wrench, Flame, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "HubWeld | Industrial Welding Parts, Distribution & Fabrication Network",
  description: "HubWeld is the go-to platform for industrial welding parts distribution, job posting, and fabrication network. Distributors, brokers, and system integrators trust HubWeld to source parts fast.",
  keywords: [
    "HubWeld", "hub weld", "hubweld.com", "hub weld platform", "hubweld network",
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
    img: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80",
  },
  {
    icon: Factory,
    title: "Fabrication Partners",
    text: "Source reliable shops for structural steel, custom assemblies, and production runs.",
    img: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80",
  },
  {
    icon: HardHat,
    title: "Certified Talent Network",
    text: "Find AWS, CWB, pipe, TIG, MIG, stainless, and aluminum specialists.",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  },
  {
    icon: Clock3,
    title: "Urgent Repair Response",
    text: "Reduce downtime with rapid support for breakdowns and field repairs.",
    img: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&q=80",
  },
];

const stats = [
  { value: "4.8 hr", label: "Avg. Response" },
  { value: "24/7", label: "Urgent Intake" },
  { value: "100%", label: "Skill-Matched" },
  { value: "50+", label: "Metro Areas" },
];

const industries = ["Construction", "Manufacturing", "Transportation", "Energy", "Agriculture", "Municipal", "Warehousing", "Food Processing"];

const faqs = [
  { q: "What is HubWeld?", a: "HubWeld is a welding and fabrication network connecting project owners with qualified welders, mobile welding crews, and fabrication shops." },
  { q: "Can HubWeld help with emergency welding repairs?", a: "Yes. HubWeld matches the job location, welding process, material, and timeline with available qualified professionals." },
  { q: "What services can customers request?", a: "Mobile welding, structural steel, pipe welding, equipment repair, stainless and aluminum welding, custom fabrication, and project-based welding labor." },
  { q: "Is HubWeld for welders or customers?", a: "Both. Customers post jobs and receive bids; welders join the network to receive job opportunities." },
];

export default function HomePage() {
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
    url: "https://www.hubweld.com",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: "https://www.hubweld.com/shop?q={search_term_string}" },
      "query-input": "required name=search_term_string",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "HubWeld", item: "https://www.hubweld.com" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* ── HERO ── */}
      <section className="relative -mx-4 mb-0 overflow-hidden rounded-2xl" style={{ margin: "0 calc(-1 * (100vw - min(1180px, calc(100% - 0px))) / 2)" }}>
        <div className="relative h-[92vh] min-h-[600px] w-full">
          <Image
            src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1800&q=85"
            alt="Professional welder at work with bright arc flash"
            fill
            priority
            className="object-cover object-center"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c0e] via-transparent to-transparent" />

          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-[1180px] px-8">
              <div className="max-w-2xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-600/10 px-4 py-1.5">
                  <Flame size={14} className="text-red-400" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-red-400">Certified Welding Network</span>
                </div>
                <h1 className="text-5xl font-black leading-[1.0] tracking-tight text-white md:text-7xl">
                  The welding network
                  <br />
                  <span className="bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">built for real-world</span>
                  <br />
                  deadlines.
                </h1>
                <p className="mt-6 max-w-lg text-lg text-white/70">
                  Post jobs, receive bids from vetted welders and fabrication shops, and coordinate field work — all in one platform.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link href="/jobs/new" className="btn-primary text-base">
                    Post a Job <ArrowRight size={18} />
                  </Link>
                  <Link href="/register?role=WELDER" className="btn-secondary text-base">
                    Join as a Welder
                  </Link>
                </div>
                <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/60">
                  <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-red-400" /> Credential-first matching</span>
                  <span className="inline-flex items-center gap-2"><MapPin size={16} className="text-red-400" /> Local & regional coverage</span>
                  <span className="inline-flex items-center gap-2"><BadgeCheck size={16} className="text-red-400" /> AWS & CWB certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="my-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/8 bg-white/8 md:grid-cols-4">
        {stats.map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center gap-1 bg-[#111315] px-6 py-6 text-center">
            <span className="text-3xl font-black text-white">{value}</span>
            <span className="text-xs uppercase tracking-widest text-white/40">{label}</span>
          </div>
        ))}
      </section>

      {/* ── INDUSTRIES ── */}
      <section className="my-8 flex flex-wrap justify-center gap-2">
        {industries.map((i) => (
          <span key={i} className="rounded border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/60 hover:border-red-500/40 hover:text-white/90 transition-colors cursor-default">
            {i}
          </span>
        ))}
      </section>

      {/* ── SERVICES ── */}
      <section className="py-14">
        <div className="mb-10">
          <span className="section-label"><Wrench size={14} /> Capabilities</span>
          <h2 className="mt-3 max-w-2xl text-4xl font-black tracking-tight text-white md:text-5xl">
            One platform. Every welding need.
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {services.map(({ icon: Icon, title, text, img }) => (
            <article key={title} className="group relative overflow-hidden rounded-xl border border-white/8 bg-[#111315] transition-all duration-300 hover:border-red-500/30 hover:shadow-xl hover:shadow-red-600/10">
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src={img}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111315] via-[#111315]/40 to-transparent" />
                <div className="absolute bottom-3 left-4 grid h-10 w-10 place-items-center rounded-lg bg-red-600/20 text-red-400 backdrop-blur-sm border border-red-500/30">
                  <Icon size={20} />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── PHOTO FEATURE STRIP ── */}
      <section className="relative my-8 overflow-hidden rounded-2xl">
        <div className="relative h-80 w-full">
          <Image
            src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1600&q=80"
            alt="Industrial fabrication shop"
            fill
            className="object-cover object-center"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/65" />
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div>
              <span className="section-label"><Zap size={14} /> For Welders</span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
                Grow your welding business.<br />
                <span className="text-red-400">Get paid to do what you do best.</span>
              </h2>
              <p className="mt-4 text-white/60">Join the HubWeld network and receive job opportunities matched to your skills, location, and availability.</p>
              <Link href="/register?role=WELDER" className="btn-primary mt-6 inline-flex">
                Apply as a Welder <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-14">
        <div className="mb-8">
          <span className="section-label"><BadgeCheck size={14} /> FAQ</span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">Common questions</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-xl border border-white/8 bg-[#111315] p-6 open:border-red-500/30">
              <summary className="cursor-pointer list-none text-base font-bold text-white group-open:text-red-400">
                <span className="flex items-center justify-between gap-4">
                  {f.q}
                  <span className="shrink-0 text-white/30 group-open:text-red-400">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
