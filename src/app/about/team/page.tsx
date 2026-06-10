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
  },
  {
    name: "Sarvenaz Alizadeh",
    role: "Co-founder & Marketing Manager",
    description: "Driving the marketing strategy and brand growth. Sarvenaz crafts compelling campaigns to increase HubWeld's market presence and ensure strong engagement across the industry.",
    linkedin: "https://www.linkedin.com/in/sarvenaz-alizadeh-0228097a/",
    image: "/images/team/sarvenaz.jpg",
    initials: "SA",
  },
  {
    name: "Farid Mashak",
    role: "Co-founder, Product Manager & R&D",
    description: "Spearheading product development and research. Farid focuses on innovating the HubWeld platform by analyzing market trends and ensuring the product continuously meets user needs.",
    linkedin: "https://www.linkedin.com/in/farid-mashak/?skipRedirect=true",
    image: "/images/team/farid.jpg",
    initials: "FM",
  },
  {
    name: "Reza Sadeghi",
    role: "Co-founder & Project Manager",
    description: "Overseeing successful execution of platform initiatives. Reza coordinates between engineering, design, and business teams to deliver key features on time.",
    linkedin: "https://www.linkedin.com/in/reza-sadeghi-37b1b181/",
    image: "/images/team/reza.jpg",
    initials: "RS",
  },
  {
    name: "Farjad Pourmohammad",
    role: "CTO — Staff Engineer",
    description: "Architecting the technical foundation of the platform. Farjad leads the engineering team, focusing on scalable infrastructure, security, and cutting-edge software solutions.",
    linkedin: "https://www.linkedin.com/in/farjadpourmohammad/",
    image: "/images/team/farjad.jpg",
    initials: "FP",
  },
];

export default function TeamPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-16 border-b border-white/8">
        <span className="section-label"><Users size={14} /> Our Team</span>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-6xl max-w-3xl">
          The people behind<br />
          <span className="bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">HubWeld.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-white/55 leading-relaxed">
          A blend of engineering, industrial, and technology experts united by a single mission — to modernize the welding industry.
        </p>
      </section>

      {/* Team Grid */}
      <section className="py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <article key={member.name} className="group flex flex-col rounded-xl border border-white/8 bg-[#111315] p-7 transition-all hover:border-red-500/30 hover:shadow-xl hover:shadow-red-600/10">
              {/* Avatar */}
              <div className="mb-5 flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-lg font-black text-white/20 select-none">
                    {member.initials}
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-white group-hover:text-red-400 transition-colors">{member.name}</h3>
                  <div className="mt-1 inline-flex items-center rounded border border-red-500/20 bg-red-600/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-red-400">
                    {member.role}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="flex-1 text-sm leading-relaxed text-white/50">{member.description}</p>

              {/* Footer */}
              <div className="mt-6 flex items-center gap-2 border-t border-white/5 pt-5">
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/50 transition-colors hover:border-[#0077b5]/40 hover:bg-[#0077b5]/10 hover:text-[#0077b5]"
                >
                  <Linkedin size={13} /> LinkedIn
                </a>
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
