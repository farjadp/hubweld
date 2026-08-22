import { Linkedin, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

const teamMembers = [
  {
    name: "Elyas Pournajaf",
    role: "Founder & CEO",
    description: "Welding engineer with fifteen years in welding equipment, consumables and cladding — including application engineering at The Linde Group and technical sales for Fronius International. Defines how certification and welder verification work on the platform.",
    creds: "M.Sc. Welding Engineering · ASNT NDT Level II · ISO 9001 Lead Auditor",
    linkedin: "https://www.linkedin.com/in/elyaspournajaf/",
    image: "/images/team/elyas.jpg",
    initials: "EP",
  },
  {
    name: "Reza Sadeghi",
    role: "Co-founder & Project Manager",
    description: "Civil and structural engineer and welding inspector with twenty-five years of site supervision and EPC project management. Designed the job-scoping model that makes bids on the platform genuinely comparable. Based in Montréal.",
    creds: "M.Sc. Civil Engineering (Structures) · WPS preparation · NDT interpretation",
    linkedin: "https://www.linkedin.com/in/reza-sadeghi-37b1b181/",
    image: "/images/team/reza.jpg",
    initials: "RS",
  },
  {
    name: "Farid Mashak",
    role: "Co-founder, Product & R&D",
    description: "Licensed professional engineer with seventeen years specifying and accepting structural work for national oil companies. Defines what a job must record — process, joint, material, acceptance criteria — so completed work can be accepted against a standard.",
    creds: "M.Sc. Construction Management · Licensed P.E. · Steel connections certified",
    linkedin: "https://www.linkedin.com/in/farid-mashak/?skipRedirect=true",
    image: "/images/team/farid.jpg",
    initials: "FM",
  },
  {
    name: "Sarvenaz Alizadeh",
    role: "Co-founder & CMO",
    description: "Twelve years of board-level B2B industrial equipment trading with European and Turkish manufacturers. Owns brand, positioning, customer research, and the pricing model for both marketplaces.",
    creds: "Board member, MPT Co. · B.Arch · CRM & industrial account development",
    linkedin: "https://www.linkedin.com/in/sarvenaz-alizadeh-0228097a/",
    image: "/images/team/sarvenaz.jpg",
    initials: "SA",
  },
  {
    name: "Farjad Pourmohammad",
    role: "CTO — Staff Engineer",
    description: "Architects the technical foundation of the platform — scalable infrastructure, security, and the engineering practice behind every release.",
    creds: "Platform architecture · Infrastructure & security",
    linkedin: "https://www.linkedin.com/in/farjadpourmohammad/",
    image: "/images/team/farjad.jpg",
    initials: "FP",
  },
];

export default function TeamPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-16 border-b border-slate-200">
        <span className="section-label"><Users size={14} /> Our Team</span>
        <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-900 md:text-7xl max-w-3xl leading-[1.05]">
          The people<br />
          <span className="text-brand">behind HubWeld.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-600 leading-relaxed">
          A blend of engineering, industrial, and technology experts united by a single mission — to modernize the welding industry.
        </p>
        <div className="mt-8 flex items-center gap-6">
          <div className="flex -space-x-3">
            {teamMembers.map((m) => (
              <div key={m.name} className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-slate-100">
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-400">{m.initials}</span>
                <img src={m.image} alt={m.name} className="relative z-10 h-full w-full object-cover" />
              </div>
            ))}
          </div>
          <span className="text-sm text-slate-500">{teamMembers.length} team members</span>
        </div>
      </section>

      {/* Team — first row: 3 cols */}
      <section className="py-16 space-y-5">
        <div className="grid gap-5 md:grid-cols-3">
          {teamMembers.slice(0, 3).map((member) => (
            <article key={member.name} className={`group relative overflow-hidden flex flex-col rounded-xl border border-slate-200 bg-white transition-all hover:border-red-500/30 hover:shadow-2xl hover:shadow-red-600/10`}>
              {/* Photo strip */}
              <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                <div className="absolute inset-0 flex items-end justify-center pb-0">
                  <div className="relative h-44 w-44">
                    <div className="absolute inset-0 flex items-center justify-center text-5xl font-black text-slate-200 select-none">{member.initials}</div>
                    <img src={member.image} alt={member.name} className="relative z-10 h-full w-full object-cover object-top" />
                  </div>
                </div>
              </div>
              {/* Content */}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-black text-slate-900 group-hover:text-brand transition-colors">{member.name}</h3>
                <div className="mt-1 mb-3 inline-flex w-fit items-center rounded border border-red-500/20 bg-red-600/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-brand">
                  {member.role}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-slate-600">{member.description}</p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-slate-500">{member.creds}</p>
                <div className="mt-5 border-t border-slate-200 pt-4">
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 transition-colors hover:border-[#0077b5]/40 hover:bg-[#0077b5]/10 hover:text-[#0077b5]">
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
            <article key={member.name} className={`group relative overflow-hidden flex flex-col rounded-xl border border-slate-200 bg-white transition-all hover:border-red-500/30 hover:shadow-2xl hover:shadow-red-600/10`}>
              <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                <div className="absolute inset-0 flex items-end justify-center pb-0">
                  <div className="relative h-44 w-44">
                    <div className="absolute inset-0 flex items-center justify-center text-5xl font-black text-slate-200 select-none">{member.initials}</div>
                    <img src={member.image} alt={member.name} className="relative z-10 h-full w-full object-cover object-top" />
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-black text-slate-900 group-hover:text-brand transition-colors">{member.name}</h3>
                <div className="mt-1 mb-3 inline-flex w-fit items-center rounded border border-red-500/20 bg-red-600/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-brand">
                  {member.role}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-slate-600">{member.description}</p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-slate-500">{member.creds}</p>
                <div className="mt-5 border-t border-slate-200 pt-4">
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 transition-colors hover:border-[#0077b5]/40 hover:bg-[#0077b5]/10 hover:text-[#0077b5]">
                    <Linkedin size={13} /> LinkedIn
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-slate-200">
        <div className="rounded-xl border border-red-500/20 bg-red-600/5 p-10 text-center">
          <h2 className="text-2xl font-black text-slate-900 mb-3">Want to join us?</h2>
          <p className="text-slate-600 mb-7 max-w-lg mx-auto">We're always looking for talented people who are passionate about the welding industry and technology.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn-primary">Join HubWeld <ArrowRight size={16} /></Link>
            <Link href="/about/product" className="btn-secondary">Learn about our product</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
