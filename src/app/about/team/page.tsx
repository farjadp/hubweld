import { Linkedin, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

const teamMembers = [
  {
    name: "Elyas Pournajaf",
    role: "Founder & CEO",
    description: "Driving the overall vision and strategy of HubWeld. Elyas brings extensive leadership experience and is dedicated to transforming the welding industry through innovative technology.",
    linkedin: "https://www.linkedin.com/in/elyaspournajaf/",
    image: "/images/team/elyas.jpg",
    initials: "EP",
    color: "from-red-600/20 to-red-900/5",
  },
  {
    name: "Sarvenaz Alizadeh",
    role: "Co-founder & Marketing",
    description: "Driving the marketing strategy and brand growth. Sarvenaz crafts compelling campaigns to increase HubWeld's market presence and ensure strong engagement across the industry.",
    linkedin: "https://www.linkedin.com/in/sarvenaz-alizadeh-0228097a/",
    image: "/images/team/sarvenaz.jpg",
    initials: "SA",
    color: "from-purple-600/20 to-purple-900/5",
  },
  {
    name: "Reza Sadeghi",
    role: "Co-founder & Project Manager",
    description: "Overseeing successful execution of platform initiatives. Reza coordinates between engineering, design, and business teams to deliver key features on time.",
    linkedin: "https://www.linkedin.com/in/reza-sadeghi-37b1b181/",
    image: "/images/team/reza.jpg",
    initials: "RS",
    color: "from-blue-600/20 to-blue-900/5",
  },
  {
    name: "Farid Mashak",
    role: "Co-founder, Product & R&D",
    description: "Spearheading product development and research. Farid focuses on innovating the HubWeld platform by analyzing market trends and ensuring the product continuously meets user needs.",
    linkedin: "https://www.linkedin.com/in/farid-mashak/?skipRedirect=true",
    image: "/images/team/farid.jpg",
    initials: "FM",
    color: "from-amber-600/20 to-amber-900/5",
  },
  {
    name: "Farjad Pourmohammad",
    role: "CTO — Staff Engineer",
    description: "Architecting the technical foundation of the platform. Farjad leads the engineering team, focusing on scalable infrastructure, security, and cutting-edge software solutions.",
    linkedin: "https://www.linkedin.com/in/farjadpourmohammad/",
    image: "/images/team/farjad.jpg",
    initials: "FP",
    color: "from-green-600/20 to-green-900/5",
  },
];

export default function TeamPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-16 border-b border-white/8">
        <span className="section-label"><Users size={14} /> Our Team</span>
        <h1 className="mt-4 text-5xl font-black tracking-tight text-white md:text-7xl max-w-3xl leading-[1.05]">
          The people<br />
          <span className="bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">behind HubWeld.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-white/55 leading-relaxed">
          A blend of engineering, industrial, and technology experts united by a single mission — to modernize the welding industry.
        </p>
        <div className="mt-8 flex items-center gap-6">
          <div className="flex -space-x-3">
            {teamMembers.map((m) => (
              <div key={m.name} className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-[#0a0c0e] bg-[#1a1d20]">
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white/30">{m.initials}</span>
                <img src={m.image} alt={m.name} className="relative z-10 h-full w-full object-cover" />
              </div>
            ))}
          </div>
          <span className="text-sm text-white/40">{teamMembers.length} team members</span>
        </div>
      </section>

      {/* Team — first row: 3 cols */}
      <section className="py-16 space-y-5">
        <div className="grid gap-5 md:grid-cols-3">
          {teamMembers.slice(0, 3).map((member) => (
            <article key={member.name} className={`group relative overflow-hidden flex flex-col rounded-xl border border-white/8 bg-[#111315] transition-all hover:border-red-500/30 hover:shadow-2xl hover:shadow-red-600/10`}>
              {/* Photo strip */}
              <div className={`relative h-52 w-full bg-gradient-to-b ${member.color} overflow-hidden`}>
                <div className="absolute inset-0 flex items-end justify-center pb-0">
                  <div className="relative h-44 w-44">
                    <div className="absolute inset-0 flex items-center justify-center text-5xl font-black text-white/5 select-none">{member.initials}</div>
                    <img src={member.image} alt={member.name} className="relative z-10 h-full w-full object-cover object-top" />
                  </div>
                </div>
              </div>
              {/* Content */}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-black text-white group-hover:text-red-400 transition-colors">{member.name}</h3>
                <div className="mt-1 mb-3 inline-flex w-fit items-center rounded border border-red-500/20 bg-red-600/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-red-400">
                  {member.role}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-white/50">{member.description}</p>
                <div className="mt-5 border-t border-white/5 pt-4">
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/50 transition-colors hover:border-[#0077b5]/40 hover:bg-[#0077b5]/10 hover:text-[#0077b5]">
                    <Linkedin size={13} /> LinkedIn
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* second row: 2 cols centered */}
        <div className="grid gap-5 md:grid-cols-2 md:max-w-2xl mx-auto">
          {teamMembers.slice(3).map((member) => (
            <article key={member.name} className={`group relative overflow-hidden flex flex-col rounded-xl border border-white/8 bg-[#111315] transition-all hover:border-red-500/30 hover:shadow-2xl hover:shadow-red-600/10`}>
              <div className={`relative h-52 w-full bg-gradient-to-b ${member.color} overflow-hidden`}>
                <div className="absolute inset-0 flex items-end justify-center pb-0">
                  <div className="relative h-44 w-44">
                    <div className="absolute inset-0 flex items-center justify-center text-5xl font-black text-white/5 select-none">{member.initials}</div>
                    <img src={member.image} alt={member.name} className="relative z-10 h-full w-full object-cover object-top" />
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-black text-white group-hover:text-red-400 transition-colors">{member.name}</h3>
                <div className="mt-1 mb-3 inline-flex w-fit items-center rounded border border-red-500/20 bg-red-600/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-red-400">
                  {member.role}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-white/50">{member.description}</p>
                <div className="mt-5 border-t border-white/5 pt-4">
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/50 transition-colors hover:border-[#0077b5]/40 hover:bg-[#0077b5]/10 hover:text-[#0077b5]">
                    <Linkedin size={13} /> LinkedIn
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-white/8">
        <div className="rounded-xl border border-red-500/20 bg-red-600/5 p-10 text-center">
          <h2 className="text-2xl font-black text-white mb-3">Want to join us?</h2>
          <p className="text-white/55 mb-7 max-w-lg mx-auto">We're always looking for talented people who are passionate about the welding industry and technology.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn-primary">Join HubWeld <ArrowRight size={16} /></Link>
            <Link href="/about/product" className="btn-secondary">Learn about our product</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
