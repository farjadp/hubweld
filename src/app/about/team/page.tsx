import { Linkedin, Mail } from "lucide-react";
import Image from "next/image";

const teamMembers = [
  {
    name: "Elyas Pournajaf",
    role: "Founder & CEO",
    description: "Driving the overall vision and strategy of HubWeld. Elyas brings extensive leadership experience and is dedicated to transforming the welding industry through innovative technology.",
    linkedin: "https://www.linkedin.com/in/elyaspournajaf/",
    image: "/images/team/elyas.jpg",
  },
  {
    name: "Sarvenaz Alizadeh",
    role: "Co-founder & COO",
    description: "Overseeing daily operations and management. Sarvenaz ensures that the HubWeld ecosystem runs smoothly, focusing on user experience, support, and sustainable growth.",
    linkedin: "https://www.linkedin.com/in/sarvenaz-alizadeh-0228097a/",
    image: "/images/team/sarvenaz.jpg",
  },
  {
    name: "Farid Mashak",
    role: "Co-founder & CBDO",
    description: "Leading business development and strategic partnerships. Farid connects HubWeld with top industry suppliers and enterprise clients to expand our B2B marketplace.",
    linkedin: "https://www.linkedin.com/in/farid-mashak/?skipRedirect=true",
    image: "/images/team/farid.jpg",
  },
  {
    name: "Reza Sadeghi",
    role: "Co-founder & CPO",
    description: "Guiding product strategy and marketing. With deep industry knowledge, Reza ensures that our features directly address the real-world pain points of welders and contractors.",
    linkedin: "https://www.linkedin.com/in/reza-sadeghi-37b1b181/",
    image: "/images/team/reza.jpg",
  },
  {
    name: "Farjad",
    role: "CTO - Staff Engineer",
    description: "Architecting the technical foundation of the platform. Farjad leads the engineering team, focusing on scalable infrastructure, security, and cutting-edge software solutions.",
    linkedin: "https://www.linkedin.com/in/farjadpourmohammad/",
    image: "/images/team/farjad.jpg",
  },
];

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-[#0a0c0e] text-white">
      {/* Header */}
      <section className="relative px-6 pt-32 pb-20 overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 mx-auto max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">
            Meet the <span className="text-red-400">HubWeld Team</span>
          </h1>
          <p className="text-lg text-white/60 leading-relaxed">
            We are a blend of engineering, industrial, and technology experts who have come together with a shared mission to revolutionize the welding industry.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="px-6 pb-32 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            {teamMembers.map((member, idx) => {
              // Creating a placeholder initial for the avatar
              const initial = member.name.charAt(0);
              return (
                <div key={idx} className="group relative rounded-3xl border border-white/10 bg-[#0f1113] p-8 text-center transition-all hover:bg-white/[0.02] hover:border-white/20 hover:shadow-2xl hover:shadow-red-600/10 flex flex-col h-full">
                  {/* Avatar */}
                  <div className="mx-auto mb-6 relative h-28 w-28 shrink-0 rounded-full ring-2 ring-red-500/20 group-hover:scale-105 transition-transform overflow-hidden shadow-xl shadow-black/50">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                  <div className="inline-block rounded-full bg-red-500/10 px-3 py-1 text-sm font-medium text-red-400 mb-4 mx-auto">
                    {member.role}
                  </div>
                  
                  <p className="text-white/50 text-sm leading-relaxed mb-8 flex-grow">
                    {member.description}
                  </p>
                  
                  <div className="flex justify-center gap-4 mt-auto pt-6 border-t border-white/5">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-[#0077b5] hover:text-white"
                      title={`${member.name} LinkedIn`}
                    >
                      <Linkedin size={18} />
                    </a>
                    {/* Placeholder for Email if needed */}
                    <button className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-white/50 transition-colors hover:bg-red-500 hover:text-white" title="Send Email">
                      <Mail size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
