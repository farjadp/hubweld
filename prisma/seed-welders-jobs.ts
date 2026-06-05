import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const pwd = await bcrypt.hash("password123", 10);

  // === WELDERS ===
  const weldersData = [
    { email: "john.miller@example.com", name: "John Miller", city: "Chicago", bio: "Expert in TIG and stainless steel pipe welding. 15 years experience in industrial settings.", skills: "TIG,Stainless,Pipe", certs: "AWS D1.1, ASME Section IX", rate: 85, exp: 15 },
    { email: "sarah.j@example.com", name: "Sarah Jenkins", city: "Detroit", bio: "Specializing in high-volume MIG fabrication and custom aluminum parts.", skills: "MIG,Aluminum,Fabrication", certs: "AWS D1.2", rate: 75, exp: 8 },
    { email: "mike.davis@example.com", name: "Mike Davis", city: "Houston", bio: "Mobile welder for heavy equipment and structural repairs. Available 24/7.", skills: "Stick,Structural,Mobile", certs: "AWS D1.1", rate: 95, exp: 20 },
    { email: "david.lee@example.com", name: "David Lee", city: "Seattle", bio: "Precision aerospace TIG welder. Mil-spec certified.", skills: "TIG,Aerospace,Precision", certs: "AWS D17.1", rate: 110, exp: 12 },
    { email: "carlos.r@example.com", name: "Carlos Ramirez", city: "Los Angeles", bio: "Automotive custom exhaust and roll cage fabrication.", skills: "MIG,TIG,Automotive", certs: "ASE Certified", rate: 80, exp: 10 },
    { email: "emma.wright@example.com", name: "Emma Wright", city: "Toronto", bio: "Sanitary tube and food-grade stainless expert for breweries and dairies.", skills: "TIG,Stainless,Sanitary Tube", certs: "CWB, TSSA", rate: 90, exp: 9 },
    { email: "jake.t@example.com", name: "Jake Thompson", city: "Calgary", bio: "Heavy equipment and mining machinery repair. Fully equipped rig.", skills: "Stick,Heavy Equipment,Mobile", certs: "CWB 47.1", rate: 105, exp: 18 },
    { email: "bob.wilson@example.com", name: "Robert Wilson", city: "Pittsburgh", bio: "Shop foreman and structural MIG fabricator. Capable of large runs.", skills: "MIG,Structural,Shop Fabrication", certs: "AWS D1.1", rate: 70, exp: 25 },
    { email: "liam.o@example.com", name: "Liam O'Connor", city: "Austin", bio: "Custom motorcycle fabrication, aluminum tanks, and bespoke metalwork.", skills: "TIG,Aluminum,Custom", certs: "AWS D1.2", rate: 85, exp: 7 },
    { email: "sophia.m@example.com", name: "Sophia Martinez", city: "New York", bio: "Artistic metalwork, high-end furniture, and architectural elements.", skills: "MIG,Artistic,Furniture", certs: "AWS D1.3", rate: 95, exp: 11 },
    { email: "daniel.b@example.com", name: "Daniel Brown", city: "Tulsa", bio: "Pipeline and pressure vessel welder. Rig ready for dispatch.", skills: "Stick,Pipeline,Pressure Vessel", certs: "API 1104, ASME Section IX", rate: 120, exp: 14 },
    { email: "oliver.t@example.com", name: "Oliver Taylor", city: "Charlotte", bio: "Motorsports fabrication, chromoly roll cages, and suspension parts.", skills: "TIG,Motorsports,Chromoly", certs: "AWS D1.1", rate: 90, exp: 8 },
    { email: "william.h@example.com", name: "William Harris", city: "Dallas", bio: "Trailer manufacturing and repair. Fast and reliable MIG welding.", skills: "MIG,Trailer Repair", certs: "AWS D1.1", rate: 65, exp: 6 },
    { email: "james.c@example.com", name: "James Clark", city: "San Diego", bio: "Marine and shipyard welding. Aluminum hull repairs.", skills: "Stick,MIG,Marine", certs: "NAVSEA, ABS", rate: 100, exp: 16 },
    { email: "ethan.l@example.com", name: "Ethan Lewis", city: "Portland", bio: "Brewing equipment fabrication, copper and stainless modifications.", skills: "TIG,Stainless,Copper", certs: "ASME Section IX", rate: 85, exp: 10 },
    { email: "alex.w@example.com", name: "Alexander Walker", city: "Denver", bio: "Heavy duty mobile repairs for dump trucks and loaders.", skills: "MIG,Stick,Heavy Duty", certs: "AWS D1.1", rate: 95, exp: 13 },
    { email: "lucas.h@example.com", name: "Lucas Hall", city: "Boulder", bio: "Titanium and thin-wall aluminum welding for bicycle frames.", skills: "TIG,Titanium,Aluminum", certs: "AWS D17.1", rate: 115, exp: 9 },
    { email: "mason.a@example.com", name: "Mason Allen", city: "Omaha", bio: "Agricultural equipment repair and farm implement modifications.", skills: "Stick,Agricultural", certs: "AWS D1.1", rate: 75, exp: 22 },
    { email: "ben.y@example.com", name: "Benjamin Young", city: "Phoenix", bio: "HVAC ducting and lightweight sheet metal fabrication.", skills: "MIG,Sheet Metal,HVAC", certs: "AWS D1.3", rate: 65, exp: 5 },
    { email: "henry.k@example.com", name: "Henry King", city: "Boston", bio: "Custom fabrication and rapid prototyping for engineering firms.", skills: "TIG,MIG,Prototyping", certs: "AWS D1.1, D1.2", rate: 105, exp: 12 },
  ];

  console.log("Seeding 20 welders...");
  for (const w of weldersData) {
    await prisma.user.upsert({
      where: { email: w.email },
      update: {},
      create: {
        email: w.email,
        name: w.name,
        passwordHash: pwd,
        role: "WELDER",
        city: w.city,
        welderProfile: {
          create: {
            bio: w.bio,
            skills: w.skills,
            certifications: w.certs,
            serviceArea: w.city,
            hourlyRate: w.rate,
            yearsExp: w.exp,
            approved: true,
          },
        },
      },
    });
  }

  // === CUSTOMERS FOR JOBS ===
  console.log("Creating some customers...");
  const customers = [];
  for (let i = 1; i <= 5; i++) {
    const cust = await prisma.user.upsert({
      where: { email: `customer${i}@example.com` },
      update: {},
      create: {
        email: `customer${i}@example.com`,
        name: `Customer Company ${i}`,
        passwordHash: pwd,
        role: "CUSTOMER",
        city: "Various",
      },
    });
    customers.push(cust);
  }

  // === JOBS ===
  const jobsData = [
    { title: "Food-grade stainless pipe welding for brewery", desc: "Need a certified TIG welder to modify our stainless brewing lines. Must be sanitary welds with back purging.", city: "Toronto", cat: "fabrication", budget: 1200 },
    { title: "Excavator bucket repair - Mobile needed", desc: "Cracked ear on an excavator bucket. Needs heavy stick welding onsite. We have the replacement steel plates.", city: "Calgary", cat: "mobile", budget: 800 },
    { title: "Custom aluminum roll cage for track car", desc: "Need a 6-point aluminum roll cage fabricated and TIG welded into my track car. Must meet safety specs.", city: "Charlotte", cat: "fabrication", budget: 2500 },
    { title: "Structural I-beams for residential construction", desc: "Need field welding for 4 structural steel I-beam connections in a new home build. Drawings available.", city: "Seattle", cat: "structural", budget: 3500 },
    { title: "Exhaust manifold repair on classic car", desc: "Cast iron exhaust manifold has a hairline crack. Needs careful pre-heating and TIG or Stick repair.", city: "Los Angeles", cat: "repair", budget: 400 },
    { title: "Fabrication of 10 custom metal tables for restaurant", desc: "We need 10 steel table bases fabricated with MIG. Clean welds required before powder coating.", city: "New York", cat: "fabrication", budget: 5000 },
    { title: "Heavy equipment trailer tongue replacement", desc: "The tongue on our flatbed trailer is bent. Needs to be cut off and a new one welded on.", city: "Dallas", cat: "repair", budget: 1500 },
    { title: "Stainless steel kitchen backsplash fabrication", desc: "Need 3 sheets of 304 stainless cut and TIG welded for a commercial kitchen backsplash.", city: "Chicago", cat: "fabrication", budget: 900 },
    { title: "Fix cracked aluminum boat hull", desc: "18ft aluminum boat has a 6-inch crack near the transom. Needs professional aluminum TIG repair.", city: "San Diego", cat: "repair", budget: 1100 },
    { title: "Farm tractor implement repair", desc: "Broken hitch on a plow implement. Quick stick weld repair needed.", city: "Omaha", cat: "repair", budget: 600 },
    { title: "Custom wrought iron driveway gate", desc: "Looking for a fabricator to build a 12ft wide custom driveway gate. Design will be provided.", city: "Austin", cat: "fabrication", budget: 4000 },
    { title: "Titanium bicycle frame repair", desc: "Small crack on the seat tube of a titanium mountain bike. Requires specialized TIG welding.", city: "Boulder", cat: "repair", budget: 300 },
    { title: "HVAC ducting modification in commercial building", desc: "Need to weld several sheet metal duct transitions on a commercial roof.", city: "Phoenix", cat: "fabrication", budget: 1800 },
    { title: "Prototype fabrication for medical device", desc: "Need precision TIG welding for a small stainless steel prototype. NDA required.", city: "Boston", cat: "fabrication", budget: 2200 },
    { title: "Dump truck bed liner welding", desc: "Need AR400 steel plates MIG welded into the bed of our dump truck to repair wear.", city: "Denver", cat: "repair", budget: 2800 },
    { title: "Pipeline pressure test fitting repair", desc: "Need an emergency repair on a high-pressure fitting. Must be certified.", city: "Tulsa", cat: "mobile", budget: 1300 },
    { title: "Custom aluminum fuel tank fabrication", desc: "Need a custom 30-gallon aluminum fuel cell built and pressure tested for a boat.", city: "Detroit", cat: "fabrication", budget: 950 },
    { title: "Shop mezzanine structural support", desc: "Need structural welding to reinforce a shop mezzanine for increased load capacity.", city: "Pittsburgh", cat: "structural", budget: 5500 },
    { title: "Sanitary tube welding for dairy plant", desc: "Upgrading dairy transfer lines. Need sanitary TIG welding on 2-inch stainless tubes.", city: "Portland", cat: "fabrication", budget: 3200 },
    { title: "Artistic metal sculpture assembly", desc: "Need a skilled welder to help assemble a large public art piece. MIG is fine, but needs to be clean.", city: "Houston", cat: "fabrication", budget: 1500 },
  ];

  console.log("Seeding 20 jobs...");
  for (let i = 0; i < jobsData.length; i++) {
    const job = jobsData[i];
    const customer = customers[i % customers.length];
    
    // Check if job exists
    const exists = await prisma.job.findFirst({ where: { title: job.title } });
    if (!exists) {
      await prisma.job.create({
        data: {
          customerId: customer.id,
          title: job.title,
          description: job.desc,
          city: job.city,
          category: job.cat,
          budget: job.budget,
          status: "OPEN",
        },
      });
    }
  }

  console.log("Done seeding welders and jobs!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
