import { Users, Target, Shield, Globe } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0a0c0e] text-white">
      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-24 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            The HubWeld Story
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
            We are building the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300">
              Future of Welding
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            HubWeld is a comprehensive network of the most professional welders, equipment suppliers, and industry experts. 
            Our goal is to seamlessly connect expertise and resources for the flawless execution of industrial and service projects.
          </p>
        </div>
      </section>

      {/* Stats & Values */}
      <section className="relative z-10 px-6 py-24 bg-gradient-to-b from-[#0a0c0e] to-[#0f1113]">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Extensive Network",
                desc: "Connect with thousands of welding specialists and reputable companies nationwide.",
                icon: Globe,
              },
              {
                title: "Quality Focused",
                desc: "We maintain strict standards to ensure the highest quality in services.",
                icon: Target,
              },
              {
                title: "Trust & Security",
                desc: "A secure platform offering transparency in ordering services and supplying goods.",
                icon: Shield,
              },
              {
                title: "Continuous Collaboration",
                desc: "Creating a foundation for long-term partnerships and B2B projects.",
                icon: Users,
              },
            ].map((item, idx) => (
              <div key={idx} className="group relative p-8 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.04] hover:border-white/10 hover:shadow-2xl hover:shadow-red-600/10">
                <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-b from-red-500/20 to-red-600/5 text-red-400 ring-1 ring-red-500/20 group-hover:scale-110 transition-transform">
                  <item.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/50 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Banner */}
      <section className="px-6 pb-32">
        <div className="mx-auto max-w-5xl rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-900/20" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
          <div className="relative z-10 p-12 md:p-16 text-center border border-red-500/20 rounded-3xl bg-[#0f1113]/80 backdrop-blur-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Join the HubWeld Community</h2>
            <p className="text-white/60 max-w-xl mx-auto mb-10 text-lg">
              Are you ready to take your business to the next level? Whether you are a welder or a supplier, we have the solution for you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="px-8 py-3.5 bg-red-600 text-white rounded-xl font-semibold shadow-lg shadow-red-600/20 hover:bg-red-500 transition-colors">
                Sign Up for Free
              </Link>
              <Link href="/about/team" className="px-8 py-3.5 bg-white/5 text-white rounded-xl font-semibold border border-white/10 hover:bg-white/10 transition-colors">
                Meet Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
