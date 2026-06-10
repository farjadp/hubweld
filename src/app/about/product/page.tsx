import { Briefcase, ShoppingBag, ArrowRight, CheckCircle2, Package, Zap, BarChart3, Layers } from "lucide-react";
import Link from "next/link";

const platformStats = [
  { value: "2-in-1", label: "Unified Platform" },
  { value: "B2B", label: "Equipment Sourcing" },
  { value: "Live", label: "Bid Matching" },
  { value: "24/7", label: "Dashboard Access" },
];

const howItWorks = [
  { icon: Layers, title: "One account, two ecosystems", desc: "Customers, welders, and suppliers all operate on the same platform with role-based dashboards." },
  { icon: BarChart3, title: "Real-time inventory & bids", desc: "Suppliers manage live stock; welders submit competitive bids on open jobs instantly." },
  { icon: Zap, title: "Fast matching", desc: "Jobs are matched to welders by skill, location, and availability — no manual searching." },
];

export default function AboutProductPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-16 border-b border-white/8">
        <span className="section-label"><Package size={14} /> Our Platform</span>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-6xl max-w-3xl">
          Two ecosystems.<br />
          <span className="bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">One platform.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-white/55 leading-relaxed">
          HubWeld brings together B2B equipment sourcing and a welding services marketplace into a single intelligent ecosystem built for the industrial welding industry.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/8 bg-white/8 sm:grid-cols-4 max-w-2xl">
          {platformStats.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 bg-[#111315] px-6 py-5 text-center">
              <span className="text-2xl font-black text-white">{value}</span>
              <span className="text-xs uppercase tracking-widest text-white/40">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Two pillars */}
      <section className="py-16 grid gap-6 lg:grid-cols-2">
        {/* B2B Marketplace */}
        <article className="group relative overflow-hidden rounded-xl border border-white/8 bg-[#111315] p-8 transition-all hover:border-red-500/30 hover:shadow-xl hover:shadow-red-600/10">
          <div className="absolute -right-6 -top-6 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity">
            <ShoppingBag size={160} />
          </div>
          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-red-400">
              <ShoppingBag size={13} /> B2B Marketplace
            </div>
            <h2 className="text-2xl font-black text-white mb-3">Direct Equipment Sourcing</h2>
            <p className="text-white/55 mb-7 leading-relaxed text-sm">
              Reputable suppliers list their welding products directly. With specialized categories and an integrated cart system, sourcing equipment has never been faster.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Real-time inventory management for suppliers",
                "Secure, transparent ordering and checkout",
                "Order management dashboard per supplier",
                "Product comparison and buyer reviews",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/65">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-red-400" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/shop" className="btn-primary inline-flex">
              Visit the Shop <ArrowRight size={16} />
            </Link>
          </div>
        </article>

        {/* Service Marketplace */}
        <article className="group relative overflow-hidden rounded-xl border border-white/8 bg-[#111315] p-8 transition-all hover:border-red-500/30 hover:shadow-xl hover:shadow-red-600/10">
          <div className="absolute -right-6 -top-6 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity">
            <Briefcase size={160} />
          </div>
          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-red-400">
              <Briefcase size={13} /> Service Marketplace
            </div>
            <h2 className="text-2xl font-black text-white mb-3">Welding Jobs & Bidding</h2>
            <p className="text-white/55 mb-7 leading-relaxed text-sm">
              Post projects and receive competitive bids from verified welders. Our skill-based matching, messaging system, and review framework guarantee quality execution.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Post jobs by type: Pipe, Mobile, Structural, Repair",
                "Certified welders submit competitive bids",
                "Star ratings and review system per welder",
                "Built-in messaging between client and welder",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/65">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-red-400" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/jobs" className="btn-primary inline-flex">
              Browse Jobs <ArrowRight size={16} />
            </Link>
          </div>
        </article>
      </section>

      {/* How it works */}
      <section className="py-16 border-t border-white/8">
        <span className="section-label"><Zap size={14} /> How it works</span>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-white mb-10">Built for speed and simplicity</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {howItWorks.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-white/8 bg-[#111315] p-6 transition-all hover:border-red-500/20">
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-red-600/10 text-red-400 border border-red-600/20">
                <Icon size={18} />
              </div>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-white/8">
        <div className="rounded-xl border border-red-500/20 bg-red-600/5 p-10 text-center">
          <h2 className="text-2xl font-black text-white mb-3">Ready to get started?</h2>
          <p className="text-white/55 mb-7 max-w-lg mx-auto">Join thousands of welders, suppliers, and project owners already using HubWeld.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn-primary">Create free account <ArrowRight size={16} /></Link>
            <Link href="/about/team" className="btn-secondary">Meet the team</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
