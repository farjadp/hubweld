import { Users, Target, Shield, Globe, ArrowRight, Flame, Briefcase, ShoppingBag, BookOpen, MapPin } from "lucide-react";
import Link from "next/link";

const stats = [
  { value: "500+", label: "Certified Welders" },
  { value: "2,000+", label: "Jobs Posted" },
  { value: "150+", label: "Verified Suppliers" },
  { value: "12", label: "Industries Served" },
];

const values = [
  {
    icon: Globe,
    title: "Extensive Network",
    desc: "Connect with thousands of welding specialists, certified professionals, and reputable industrial companies across North America.",
  },
  {
    icon: Target,
    title: "Quality Focused",
    desc: "Every welder in our network goes through a verification process. We maintain strict standards to ensure the highest quality in every project.",
  },
  {
    icon: Shield,
    title: "Trust & Security",
    desc: "A secure, transparent platform for ordering services and sourcing equipment. Your projects and payments are always protected.",
  },
  {
    icon: Users,
    title: "Built for Collaboration",
    desc: "From one-off repairs to long-term B2B partnerships — HubWeld is the foundation for lasting industrial relationships.",
  },
];

const timeline = [
  { year: "2023", title: "Founded", desc: "HubWeld was founded by a team of welding industry veterans and technology professionals who saw a critical gap in how welding services and equipment were sourced." },
  { year: "2024", title: "Platform Launch", desc: "We launched the first version of the HubWeld marketplace, connecting customers with certified welders across Canada and the United States." },
  { year: "2024", title: "B2B Marketplace", desc: "Expanded the platform to include a full B2B equipment marketplace, allowing verified suppliers to list and sell welding products directly to professionals." },
  { year: "2025", title: "Growing Network", desc: "Reached 500+ certified welders, 150+ verified suppliers, and over 2,000 successfully completed jobs across 12 major industries." },
];

const subpages = [
  {
    href: "/about/team",
    icon: Users,
    title: "Our Team",
    desc: "Meet the founders and engineers building HubWeld — a mix of welding industry veterans and technology experts.",
  },
  {
    href: "/about/product",
    icon: ShoppingBag,
    title: "Our Product",
    desc: "Learn how HubWeld's two-sided platform works — B2B equipment sourcing and a welding services marketplace in one place.",
  },
  {
    href: "/blog",
    icon: BookOpen,
    title: "Blog & Insights",
    desc: "Industry news, welding tips, and platform updates from the HubWeld team.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-16 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-xs font-black uppercase tracking-widest text-brand">The HubWeld Story</span>
        </div>
        <h1 className="text-5xl font-black tracking-tight text-slate-900 md:text-7xl max-w-4xl leading-[1.05]">
          We are building the<br />
          <span className="text-brand">future of welding.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed">
          HubWeld is a comprehensive network connecting professional welders, equipment suppliers, and industrial project owners. 
          We built the platform we always wished existed — fast, transparent, and built for real-world deadlines.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:grid-cols-4 max-w-2xl">
          {stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 bg-ink-900 px-6 py-5 text-center">
              <span className="text-3xl font-black text-slate-900">{value}</span>
              <span className="text-xs uppercase tracking-widest text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 border-b border-slate-200 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="section-label"><Flame size={14} /> Our Mission</span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            Close the gap between welding expertise and industrial demand.
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            The welding industry runs on relationships, reputation, and reliability. But for decades, finding the right welder or sourcing specialized equipment meant making dozens of phone calls, relying on word of mouth, and waiting days for quotes.
          </p>
          <p className="mt-4 text-slate-600 leading-relaxed">
            HubWeld changes that. We built a platform where project owners can post jobs in minutes and receive bids from verified professionals, while suppliers can list products and reach buyers actively searching for them — all in one place.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/jobs" className="btn-primary">Browse Jobs <ArrowRight size={16} /></Link>
            <Link href="/shop" className="btn-secondary">View Shop</Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Briefcase, label: "Post a welding job", sub: "Get bids in hours, not days" },
            { icon: ShoppingBag, label: "Source equipment", sub: "From verified B2B suppliers" },
            { icon: Users, label: "Find certified welders", sub: "Verified skills & location" },
            { icon: MapPin, label: "Mobile & on-site", sub: "Coverage across North America" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-red-600/10 border border-red-600/20 text-brand">
                <Icon size={16} />
              </div>
              <div className="font-bold text-slate-900 text-sm">{label}</div>
              <div className="mt-1 text-xs text-slate-500">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="py-16 border-b border-slate-200">
        <span className="section-label"><Shield size={14} /> Our Values</span>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 mb-10">What we stand for</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-red-500/30 hover:shadow-xl hover:shadow-red-600/10">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-red-600/10 border border-red-600/20 text-brand transition-transform group-hover:scale-110">
                <Icon size={20} />
              </div>
              <h3 className="font-black text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 border-b border-slate-200">
        <span className="section-label"><Target size={14} /> Our Journey</span>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 mb-12">How we got here</h2>
        <div className="relative">
          <div className="absolute left-[27px] top-0 bottom-0 w-px bg-slate-100" />
          <div className="space-y-8">
            {timeline.map(({ year, title, desc }) => (
              <div key={year + title} className="flex gap-6">
                <div className="relative flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-red-600/20 bg-red-600/10 text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand">{year}</span>
                </div>
                <div className="pt-1 pb-2">
                  <h3 className="font-black text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm text-slate-500 leading-relaxed max-w-xl">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subpage nav */}
      <section className="py-16 border-b border-slate-200">
        <h2 className="text-2xl font-black text-slate-900 mb-8">Learn more about HubWeld</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {subpages.map(({ href, icon: Icon, title, desc }) => (
            <Link key={href} href={href} className="group flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-red-500/30 hover:shadow-xl hover:shadow-red-600/10">
              <div className="grid h-10 w-10 place-items-center rounded-lg border border-red-600/20 bg-red-600/10 text-brand">
                <Icon size={18} />
              </div>
              <div>
                <div className="font-black text-slate-900 group-hover:text-brand transition-colors">{title}</div>
                <p className="mt-1 text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
              <div className="mt-auto flex items-center gap-1 text-xs font-bold text-brand opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="rounded-xl border border-red-500/20 bg-red-600/5 p-10 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-3">Ready to join HubWeld?</h2>
          <p className="text-slate-600 mb-8 max-w-lg mx-auto">Whether you're a welder, a supplier, or a company with projects to complete — there's a place for you on HubWeld.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register?role=WELDER" className="btn-primary">Join as a Welder <ArrowRight size={16} /></Link>
            <Link href="/register?role=SUPPLIER" className="btn-secondary">Join as a Supplier</Link>
            <Link href="/register?role=CUSTOMER" className="btn-secondary">Post a Job</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
