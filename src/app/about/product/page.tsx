import { Briefcase, ShoppingBag, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function AboutProductPage() {
  return (
    <main className="min-h-screen bg-[#0a0c0e] text-white">
      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-24 overflow-hidden border-b border-white/5">
        <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-red-600/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">
            A Unified Platform for <br />
            <span className="text-red-400">Equipment Supply</span> & <span className="text-red-400">Welding Services</span>
          </h1>
          <p className="text-lg text-white/60 max-w-3xl mx-auto mb-10 leading-relaxed">
            The HubWeld platform is specifically designed to meet the demands of the welding industry. 
            We have brought the two most vital parts of this industry together into one intelligent ecosystem.
          </p>
        </div>
      </section>

      {/* Product Features */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Marketplace (B2B) */}
          <div className="relative p-10 rounded-3xl border border-white/10 bg-[#0f1113] overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShoppingBag size={120} />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-lg bg-red-500/20 px-3 py-1 text-red-400 font-semibold mb-6">
                B2B Marketplace
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Direct Equipment Sourcing</h2>
              <p className="text-white/60 mb-8 leading-relaxed">
                Reputable suppliers can sell their products directly to specialists and companies. With specialized categories and an integrated shopping cart system, buying welding equipment has never been easier.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  "Easy product management with real-time inventory",
                  "Transparent and secure ordering and payment process",
                  "Dedicated order management dashboard for suppliers",
                  "Ability to compare and review specialized tools"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-white/70">
                    <CheckCircle2 size={18} className="text-red-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/shop" className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 font-medium transition-colors">
                Visit the Shop <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Service Marketplace */}
          <div className="relative p-10 rounded-3xl border border-white/10 bg-[#0f1113] overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Briefcase size={120} />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-lg bg-red-500/20 px-3 py-1 text-red-400 font-semibold mb-6">
                Service Marketplace
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Welding Projects & Bidding</h2>
              <p className="text-white/60 mb-8 leading-relaxed">
                Clients can post their projects, and certified welders can submit bids based on their skill sets. Our messaging system and review framework ensure high-quality job execution.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  "Post projects based on service types (e.g., Piping, Mobile, Structural)",
                  "Enable certified welders to submit competitive bids",
                  "Review and rating system to guarantee specialist quality",
                  "Built-in messaging for direct communication between client and welder"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-white/70">
                    <CheckCircle2 size={18} className="text-red-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/jobs" className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 font-medium transition-colors">
                Browse Projects <ArrowRight size={18} />
              </Link>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
