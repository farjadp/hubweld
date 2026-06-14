import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function d(dateStr: string): Date {
  return new Date(dateStr);
}

async function main() {
  console.log("🗂️  Seeding project boards and tasks...");

  await prisma.projectTask.deleteMany();
  await prisma.projectBoard.deleteMany();

  // ── Boards (Phases) ──────────────────────────────────────────────────────
  const b1 = await prisma.projectBoard.create({
    data: {
      title: "Phase 1 — Foundation & Setup",
      description: "Initial project setup, database design, authentication and overall architecture",
      color: "#6366f1",
      sortOrder: 1,
    },
  });

  const b2 = await prisma.projectBoard.create({
    data: {
      title: "Phase 2 — Service Marketplace",
      description: "Welding service platform: job posting, bidding, messaging, reviews",
      color: "#0ea5e9",
      sortOrder: 2,
    },
  });

  const b3 = await prisma.projectBoard.create({
    data: {
      title: "Phase 3 — B2B Shop",
      description: "B2B equipment store: products, cart, checkout, orders",
      color: "#f59e0b",
      sortOrder: 3,
    },
  });

  const b4 = await prisma.projectBoard.create({
    data: {
      title: "Phase 4 — Admin Panel & Blog",
      description: "Full admin panel, blog system with TipTap and AI article generation",
      color: "#10b981",
      sortOrder: 4,
    },
  });

  const b5 = await prisma.projectBoard.create({
    data: {
      title: "Phase 5 — Polish, SEO & Deploy",
      description: "UI polish, SEO, landing pages, Docker and Railway deployment",
      color: "#ef4444",
      sortOrder: 5,
    },
  });

  const b6 = await prisma.projectBoard.create({
    data: {
      title: "Bugs & Issues",
      description: "Reported bugs, deployment issues and urgent fixes",
      color: "#dc2626",
      sortOrder: 6,
    },
  });

  // ── PHASE 1 Tasks (Jun 12 – Jul 20, 2025) ────────────────────────────────
  await prisma.projectTask.createMany({
    data: [
      {
        boardId: b1.id, title: "راه‌اندازی اولیه Next.js 14 با App Router",
        assignee: "Farjad", priority: "HIGH", status: "DONE",
        startDate: d("2025-06-12"), dueDate: d("2025-06-14"), completedAt: d("2025-06-14"),
        tags: "setup,nextjs", sortOrder: 1,
        description: "ایجاد پروژه با create-next-app، تنظیم TypeScript، Tailwind CSS و ESLint.",
      },
      {
        boardId: b1.id, title: "طراحی و پیاده‌سازی Prisma Schema اولیه",
        assignee: "Farjad", priority: "CRITICAL", status: "DONE",
        startDate: d("2025-06-14"), dueDate: d("2025-06-18"), completedAt: d("2025-06-20"),
        tags: "database,prisma",sortOrder: 2,
        description: "مدل‌های User, WelderProfile, Job, Bid, Review, Message. تاخیر ۲ روزه به دلیل بازطراحی ساختار roles.",
      },
      {
        boardId: b1.id, title: "پیاده‌سازی سیستم Authentication با NextAuth.js",
        assignee: "Farjad", priority: "CRITICAL", status: "DONE",
        startDate: d("2025-06-20"), dueDate: d("2025-06-25"), completedAt: d("2025-06-26"),
        tags: "auth,nextauth", sortOrder: 3,
        description: "CredentialsProvider با bcrypt، JWT session، callback‌های role-based.",
      },
      {
        boardId: b1.id, title: "طراحی Design System و تم اصلی (dark theme)",
        assignee: "Sarvenaz", priority: "HIGH", status: "DONE",
        startDate: d("2025-06-15"), dueDate: d("2025-06-22"), completedAt: d("2025-06-24"),
        tags: "design,ui", sortOrder: 4,
        description: "تعریف palette رنگی، typography، glassmorphism cards. ۲ روز اضافه برای تایید تیم.",
      },
      {
        boardId: b1.id, title: "ساخت Navbar responsive با dropdown",
        assignee: "Sarvenaz", priority: "HIGH", status: "DONE",
        startDate: d("2025-06-24"), dueDate: d("2025-06-28"), completedAt: d("2025-06-29"),
        tags: "ui,navbar", sortOrder: 5,
        description: "Navbar با mobile menu، dropdown برای Shop و Company. انیمیشن glassmorphism.",
      },
      {
        boardId: b1.id, title: "صفحات Register و Login با validation",
        assignee: "Farjad", priority: "HIGH", status: "DONE",
        startDate: d("2025-06-26"), dueDate: d("2025-07-01"), completedAt: d("2025-07-02"),
        tags: "auth,forms", sortOrder: 6,
        description: "فرم‌های register/login با zod validation، error handling و redirect بر اساس role.",
      },
      {
        boardId: b1.id, title: "تنظیم Middleware و Route Protection",
        assignee: "Farjad", priority: "HIGH", status: "DONE",
        startDate: d("2025-07-02"), dueDate: d("2025-07-04"), completedAt: d("2025-07-04"),
        tags: "auth,middleware", sortOrder: 7,
        description: "محافظت از /dashboard, /admin, /jobs/new با NextAuth middleware.",
      },
      {
        boardId: b1.id, title: "Landing Page اصلی (Homepage)",
        assignee: "Sarvenaz", priority: "MEDIUM", status: "DONE",
        startDate: d("2025-07-01"), dueDate: d("2025-07-10"), completedAt: d("2025-07-14"),
        tags: "ui,marketing", sortOrder: 8,
        description: "Hero section، feature cards، industry band، CTA. تاخیر ۴ روزه به دلیل تغییر کپی‌رایتینگ.",
      },
      {
        boardId: b1.id, title: "تنظیم Docker و Dockerfile اولیه",
        assignee: "Reza", priority: "MEDIUM", status: "DONE",
        startDate: d("2025-07-05"), dueDate: d("2025-07-09"), completedAt: d("2025-07-10"),
        tags: "devops,docker", sortOrder: 9,
        description: "Dockerfile multi-stage، docker-entrypoint.sh، .dockerignore.",
      },
    ],
  });

  // ── PHASE 2 Tasks (Jul 21 – Sep 15, 2025) ────────────────────────────────
  await prisma.projectTask.createMany({
    data: [
      {
        boardId: b2.id, title: "صفحه لیست Jobs با فیلتر و جستجو",
        assignee: "Sarvenaz", priority: "HIGH", status: "DONE",
        startDate: d("2025-07-21"), dueDate: d("2025-07-28"), completedAt: d("2025-07-29"),
        tags: "jobs,ui", sortOrder: 1,
        description: "نمایش لیست پروژه‌های باز با فیلتر category، city و status.",
      },
      {
        boardId: b2.id, title: "فرم ثبت Job جدید توسط Customer",
        assignee: "Farjad", priority: "HIGH", status: "DONE",
        startDate: d("2025-07-28"), dueDate: d("2025-08-02"), completedAt: d("2025-08-03"),
        tags: "jobs,forms", sortOrder: 2,
        description: "فرم با title, description, city, category, budget. server action برای ذخیره.",
      },
      {
        boardId: b2.id, title: "صفحه جزئیات Job و سیستم Bid",
        assignee: "Farjad", priority: "CRITICAL", status: "DONE",
        startDate: d("2025-08-03"), dueDate: d("2025-08-10"), completedAt: d("2025-08-13"),
        tags: "jobs,bids", sortOrder: 3,
        description: "نمایش جزئیات job، فرم ارسال bid توسط welder، لیست bidها. ۳ روز تاخیر به دلیل race condition در accept bid.",
      },
      {
        boardId: b2.id, title: "API قبول/رد بید و تغییر status Job",
        assignee: "Farjad", priority: "CRITICAL", status: "DONE",
        startDate: d("2025-08-13"), dueDate: d("2025-08-16"), completedAt: d("2025-08-17"),
        tags: "jobs,api", sortOrder: 4,
        description: "endpoint برای accept/reject bid، update کردن Job.status به ASSIGNED.",
      },
      {
        boardId: b2.id, title: "Welder Profile و صفحه عمومی جوشکار",
        assignee: "Elyas", priority: "HIGH", status: "DONE",
        startDate: d("2025-08-04"), dueDate: d("2025-08-12"), completedAt: d("2025-08-15"),
        tags: "welder,profile", sortOrder: 5,
        description: "WelderProfile با skills, certifications, serviceArea, hourlyRate. صفحه public /welders/[id].",
      },
      {
        boardId: b2.id, title: "سیستم پیام‌رسانی داخلی (Messaging)",
        assignee: "Elyas", priority: "HIGH", status: "DONE",
        startDate: d("2025-08-15"), dueDate: d("2025-08-22"), completedAt: d("2025-08-28"),
        tags: "messaging,jobs", sortOrder: 6,
        description: "سیستم message بین customer و welder در context یک job. ۶ روز تاخیر به دلیل مشکل permission و دسترسی.",
      },
      {
        boardId: b2.id, title: "سیستم Review و Rating بعد از اتمام Job",
        assignee: "Farid", priority: "MEDIUM", status: "DONE",
        startDate: d("2025-08-28"), dueDate: d("2025-09-04"), completedAt: d("2025-09-06"),
        tags: "reviews,ux", sortOrder: 7,
        description: "فرم ثبت review با rating ستاره، نمایش میانگین رتبه روی پروفایل.",
      },
      {
        boardId: b2.id, title: "Dashboard کاربر (CUSTOMER و WELDER)",
        assignee: "Sarvenaz", priority: "HIGH", status: "DONE",
        startDate: d("2025-09-01"), dueDate: d("2025-09-08"), completedAt: d("2025-09-10"),
        tags: "dashboard,ux", sortOrder: 8,
        description: "خلاصه jobs فعال، بیدهای کاربر، لینک به پروفایل. طراحی responsive.",
      },
      {
        boardId: b2.id, title: "صفحه ویرایش پروفایل کاربر",
        assignee: "Farjad", priority: "MEDIUM", status: "DONE",
        startDate: d("2025-09-08"), dueDate: d("2025-09-12"), completedAt: d("2025-09-13"),
        tags: "profile,dashboard", sortOrder: 9,
        description: "API PATCH /api/profile برای آپدیت name, city, phone و اطلاعات welder profile.",
      },
      {
        boardId: b2.id, title: "دایرکتوری جوشکاران (/welders)",
        assignee: "Elyas", priority: "LOW", status: "DONE",
        startDate: d("2025-09-10"), dueDate: d("2025-09-15"), completedAt: d("2025-09-16"),
        tags: "welder,directory", sortOrder: 10,
        description: "لیست عمومی welderهای approve‌شده با skills و serviceArea.",
      },
    ],
  });

  // ── PHASE 3 Tasks (Sep 16 – Nov 10, 2025) ───────────────────────────────
  await prisma.projectTask.createMany({
    data: [
      {
        boardId: b3.id, title: "طراحی Schema کامل B2B Shop (Prisma)",
        assignee: "Farjad", priority: "CRITICAL", status: "DONE",
        startDate: d("2025-09-16"), dueDate: d("2025-09-20"), completedAt: d("2025-09-23"),
        tags: "database,shop", sortOrder: 1,
        description: "مدل‌های SupplierProfile, ProductCategory, Product, Cart, CartItem, Order, OrderItem. ۳ روز تاخیر برای بازطراحی relation OrderItem→Supplier.",
      },
      {
        boardId: b3.id, title: "Supplier Profile و فرم ثبت‌نام",
        assignee: "Elyas", priority: "HIGH", status: "DONE",
        startDate: d("2025-09-23"), dueDate: d("2025-09-30"), completedAt: d("2025-10-01"),
        tags: "supplier,profile", sortOrder: 2,
        description: "فرم ثبت‌نام supplier با businessName, description, website, logo. منتظر approve ادمین.",
      },
      {
        boardId: b3.id, title: "صفحه Shop اصلی با sidebar و فیلتر",
        assignee: "Sarvenaz", priority: "HIGH", status: "DONE",
        startDate: d("2025-09-30"), dueDate: d("2025-10-07"), completedAt: d("2025-10-09"),
        tags: "shop,ui", sortOrder: 3,
        description: "لیست محصولات با ShopSidebar، فیلتر بر اساس category، مرتب‌سازی.",
      },
      {
        boardId: b3.id, title: "صفحه جزئیات محصول (/shop/p/[slug])",
        assignee: "Sarvenaz", priority: "HIGH", status: "DONE",
        startDate: d("2025-10-07"), dueDate: d("2025-10-12"), completedAt: d("2025-10-13"),
        tags: "shop,ui", sortOrder: 4,
        description: "نمایش عکس، قیمت، موجودی، specs و دکمه Add to Cart.",
      },
      {
        boardId: b3.id, title: "سیستم Cart (اضافه، کم، حذف)",
        assignee: "Farjad", priority: "HIGH", status: "DONE",
        startDate: d("2025-10-10"), dueDate: d("2025-10-16"), completedAt: d("2025-10-18"),
        tags: "cart,api", sortOrder: 5,
        description: "API routes برای GET/POST/PATCH/DELETE cart. server-side cart با userId.",
      },
      {
        boardId: b3.id, title: "صفحه Cart UI",
        assignee: "Sarvenaz", priority: "HIGH", status: "DONE",
        startDate: d("2025-10-16"), dueDate: d("2025-10-20"), completedAt: d("2025-10-21"),
        tags: "cart,ui", sortOrder: 6,
        description: "نمایش سبد خرید، تغییر تعداد، حذف آیتم، نمایش قیمت کل.",
      },
      {
        boardId: b3.id, title: "فرم Checkout و ثبت سفارش",
        assignee: "Farjad", priority: "CRITICAL", status: "DONE",
        startDate: d("2025-10-20"), dueDate: d("2025-10-28"), completedAt: d("2025-11-02"),
        tags: "checkout,orders", sortOrder: 7,
        description: "فرم آدرس shipping، ثبت Order و OrderItem‌ها. ۵ روز تاخیر به دلیل باگ در محاسبه tax و split سفارش per-supplier.",
      },
      {
        boardId: b3.id, title: "صفحه تاریخچه سفارشات (/orders)",
        assignee: "Elyas", priority: "MEDIUM", status: "DONE",
        startDate: d("2025-11-02"), dueDate: d("2025-11-06"), completedAt: d("2025-11-06"),
        tags: "orders,dashboard", sortOrder: 8,
        description: "لیست سفارشات کاربر با status و جزئیات هر order.",
      },
      {
        boardId: b3.id, title: "Supplier Dashboard (مدیریت محصولات و سفارشات)",
        assignee: "Farid", priority: "HIGH", status: "DONE",
        startDate: d("2025-10-28"), dueDate: d("2025-11-07"), completedAt: d("2025-11-10"),
        tags: "supplier,dashboard", sortOrder: 9,
        description: "داشبورد supplier با لیست محصولات، افزودن/ویرایش/حذف محصول، مشاهده سفارشات مرتبط.",
      },
      {
        boardId: b3.id, title: "مدیریت دسته‌بندی محصولات (ProductCategory)",
        assignee: "Farid", priority: "MEDIUM", status: "DONE",
        startDate: d("2025-11-05"), dueDate: d("2025-11-10"), completedAt: d("2025-11-10"),
        tags: "shop,admin", sortOrder: 10,
        description: "ساختار hierarchical برای categories با parentId، slug یکتا.",
      },
    ],
  });

  // ── PHASE 4 Tasks (Nov 11 – Jan 20, 2026) ────────────────────────────────
  await prisma.projectTask.createMany({
    data: [
      {
        boardId: b4.id, title: "Admin Panel — Layout و Sidebar",
        assignee: "Sarvenaz", priority: "HIGH", status: "DONE",
        startDate: d("2025-11-11"), dueDate: d("2025-11-14"), completedAt: d("2025-11-14"),
        tags: "admin,ui", sortOrder: 1,
        description: "Sidebar ادمین با nav items و active state. Layout مشترک برای همه صفحات ادمین.",
      },
      {
        boardId: b4.id, title: "Admin Overview Dashboard",
        assignee: "Sarvenaz", priority: "HIGH", status: "DONE",
        startDate: d("2025-11-14"), dueDate: d("2025-11-18"), completedAt: d("2025-11-19"),
        tags: "admin,dashboard", sortOrder: 2,
        description: "کارت‌های آمار کلی: تعداد کاربران، jobها، سفارشات، درآمد. با رنگ‌بندی status.",
      },
      {
        boardId: b4.id, title: "Admin — مدیریت Users (ban, role change)",
        assignee: "Farjad", priority: "HIGH", status: "DONE",
        startDate: d("2025-11-18"), dueDate: d("2025-11-24"), completedAt: d("2025-11-26"),
        tags: "admin,users", sortOrder: 3,
        description: "لیست کاربران با جستجو، امکان ban/unban و تغییر role.",
      },
      {
        boardId: b4.id, title: "Admin — مدیریت Jobs و تغییر status",
        assignee: "Farjad", priority: "MEDIUM", status: "DONE",
        startDate: d("2025-11-24"), dueDate: d("2025-11-28"), completedAt: d("2025-11-28"),
        tags: "admin,jobs", sortOrder: 4,
        description: "لیست همه jobها با امکان مشاهده جزئیات و تغییر status.",
      },
      {
        boardId: b4.id, title: "Admin — تایید/رد Supplier و Welder",
        assignee: "Elyas", priority: "HIGH", status: "DONE",
        startDate: d("2025-11-26"), dueDate: d("2025-12-02"), completedAt: d("2025-12-03"),
        tags: "admin,suppliers", sortOrder: 5,
        description: "صفحه suppliers با دکمه approve/reject. API برای approve welder profile.",
      },
      {
        boardId: b4.id, title: "Admin — مدیریت Products و Orders",
        assignee: "Farid", priority: "MEDIUM", status: "DONE",
        startDate: d("2025-12-01"), dueDate: d("2025-12-08"), completedAt: d("2025-12-09"),
        tags: "admin,products,orders", sortOrder: 6,
        description: "لیست محصولات با جستجو. لیست سفارشات با امکان تغییر status به SHIPPED/COMPLETED.",
      },
      {
        boardId: b4.id, title: "طراحی Schema بلاگ (Post, PostCategory, PostTag)",
        assignee: "Farjad", priority: "HIGH", status: "DONE",
        startDate: d("2025-12-08"), dueDate: d("2025-12-12"), completedAt: d("2025-12-15"),
        tags: "blog,database", sortOrder: 7,
        description: "مدل‌های Post, PostCategory, PostTag, PostToTag. field‌های SEO: seoTitle, seoDesc, seoKeywords.",
      },
      {
        boardId: b4.id, title: "Admin Blog — ویرایشگر TipTap Rich Text",
        assignee: "Farid", priority: "HIGH", status: "DONE",
        startDate: d("2025-12-15"), dueDate: d("2025-12-22"), completedAt: d("2025-12-30"),
        tags: "blog,tiptap,editor", sortOrder: 8,
        description: "ادغام TipTap با extension‌های table, image, link, underline, textAlign. ۸ روز تاخیر به دلیل مشکل SSR با TipTap و نیاز به use client.",
      },
      {
        boardId: b4.id, title: "Admin Blog — مدیریت Posts (CRUD)",
        assignee: "Farjad", priority: "HIGH", status: "DONE",
        startDate: d("2025-12-28"), dueDate: d("2026-01-05"), completedAt: d("2026-01-07"),
        tags: "blog,admin", sortOrder: 9,
        description: "صفحات لیست، ایجاد، ویرایش و حذف پست. publish/draft toggle.",
      },
      {
        boardId: b4.id, title: "Admin Blog — Categories و Tags",
        assignee: "Elyas", priority: "MEDIUM", status: "DONE",
        startDate: d("2026-01-05"), dueDate: d("2026-01-10"), completedAt: d("2026-01-10"),
        tags: "blog,categories,tags", sortOrder: 10,
        description: "CRUD برای PostCategory (hierarchical) و PostTag. assign به پست.",
      },
      {
        boardId: b4.id, title: "AI Blog Auto-generation با OpenAI gpt-4o",
        assignee: "Farjad", priority: "HIGH", status: "DONE",
        startDate: d("2026-01-10"), dueDate: d("2026-01-16"), completedAt: d("2026-01-20"),
        tags: "ai,blog,openai", sortOrder: 11,
        description: "endpoint /api/cron/generate-article با prompt فارسی SEO/GEO/AIO. ۴ روز تاخیر برای tune کردن prompt و کیفیت خروجی.",
      },
      {
        boardId: b4.id, title: "GitHub Actions Cron برای تولید مقاله خودکار",
        assignee: "Reza", priority: "MEDIUM", status: "DONE",
        startDate: d("2026-01-18"), dueDate: d("2026-01-20"), completedAt: d("2026-01-20"),
        tags: "ci,github-actions,cron", sortOrder: 12,
        description: "workflow YAML برای trigger سه‌بار در هفته. تنظیم secrets: OPENAI_API_KEY, CRON_SECRET, PRODUCTION_DOMAIN.",
      },
      {
        boardId: b4.id, title: "صفحه عمومی بلاگ (/blog) و صفحه پست",
        assignee: "Sarvenaz", priority: "HIGH", status: "DONE",
        startDate: d("2026-01-15"), dueDate: d("2026-01-22"), completedAt: d("2026-01-23"),
        tags: "blog,ui", sortOrder: 13,
        description: "لیست پست‌های published با کارت زیبا. صفحه single post با HTML rendering.",
      },
    ],
  });

  // ── PHASE 5 Tasks (Jan 24 – Jun 12, 2026) ────────────────────────────────
  await prisma.projectTask.createMany({
    data: [
      {
        boardId: b5.id, title: "صفحات About Us (شرکت، محصول، تیم)",
        assignee: "Sarvenaz", priority: "MEDIUM", status: "DONE",
        startDate: d("2026-01-24"), dueDate: d("2026-01-31"), completedAt: d("2026-02-03"),
        tags: "ui,marketing,about", sortOrder: 1,
        description: "سه صفحه /about, /about/product, /about/team با glassmorphism UI و عکس اعضای تیم.",
      },
      {
        boardId: b5.id, title: "صفحات Solutions و Directory",
        assignee: "Elyas", priority: "LOW", status: "DONE",
        startDate: d("2026-02-01"), dueDate: d("2026-02-07"), completedAt: d("2026-02-10"),
        tags: "ui,marketing", sortOrder: 2,
        description: "صفحه Solutions برای معرفی خدمات. Directory لیست welder‌ها با فیلتر.",
      },
      {
        boardId: b5.id, title: "SEO — metadata، sitemap.xml، robots.txt",
        assignee: "Farid", priority: "HIGH", status: "DONE",
        startDate: d("2026-02-08"), dueDate: d("2026-02-14"), completedAt: d("2026-02-16"),
        tags: "seo,metadata", sortOrder: 3,
        description: "metadata پویا برای همه صفحات. sitemap.xml برای blog posts. robots.txt.",
      },
      {
        boardId: b5.id, title: "Open Graph و Twitter Card metadata",
        assignee: "Farid", priority: "MEDIUM", status: "DONE",
        startDate: d("2026-02-14"), dueDate: d("2026-02-17"), completedAt: d("2026-02-18"),
        tags: "seo,og,twitter", sortOrder: 4,
        description: "OG image و structured data JSON-LD برای صفحات اصلی.",
      },
      {
        boardId: b5.id, title: "بهینه‌سازی Performance و Lazy Loading",
        assignee: "Farjad", priority: "MEDIUM", status: "DONE",
        startDate: d("2026-02-18"), dueDate: d("2026-02-25"), completedAt: d("2026-03-01"),
        tags: "performance,nextjs", sortOrder: 5,
        description: "بهینه‌سازی image loading، dynamic imports، کاهش bundle size. ۴ روز تاخیر.",
      },
      {
        boardId: b5.id, title: "Mobile Responsiveness کامل همه صفحات",
        assignee: "Sarvenaz", priority: "HIGH", status: "DONE",
        startDate: d("2026-02-20"), dueDate: d("2026-03-05"), completedAt: d("2026-03-10"),
        tags: "ui,mobile,responsive", sortOrder: 6,
        description: "بررسی و fix همه صفحات روی موبایل. ۵ روز تاخیر به دلیل تعداد زیاد صفحات.",
      },
      {
        boardId: b5.id, title: "Seed Data — محصولات، بلاگ، جوشکاران",
        assignee: "Reza", priority: "MEDIUM", status: "DONE",
        startDate: d("2026-03-05"), dueDate: d("2026-03-10"), completedAt: d("2026-03-11"),
        tags: "database,seed", sortOrder: 7,
        description: "seed-blog.ts, seed-welders-jobs.ts, seed-more-blogs.ts برای داده‌های نمایشی.",
      },
      {
        boardId: b5.id, title: "Railway Deployment — اولین استقرار",
        assignee: "Reza", priority: "CRITICAL", status: "DONE",
        startDate: d("2026-03-10"), dueDate: d("2026-03-14"), completedAt: d("2026-03-22"),
        tags: "devops,railway,deploy", sortOrder: 8,
        description: "استقرار اول روی Railway. ۸ روز تاخیر به دلیل مشکل ephemeral SQLite و نیاز به persistent volume mount.",
      },
      {
        boardId: b5.id, title: "رفع مشکل SQLite persistence روی Railway",
        assignee: "Reza", priority: "CRITICAL", status: "DONE",
        startDate: d("2026-03-16"), dueDate: d("2026-03-20"), completedAt: d("2026-03-22"),
        tags: "devops,railway,sqlite", sortOrder: 9,
        description: "تنظیم volume mount، تغییر DATABASE_URL به file:/data/sqlite.db. بحث با تیم در مورد migrate به Postgres.",
      },
      {
        boardId: b5.id, title: "Navbar — اضافه کردن dropdown Company",
        assignee: "Sarvenaz", priority: "LOW", status: "DONE",
        startDate: d("2026-04-01"), dueDate: d("2026-04-04"), completedAt: d("2026-04-04"),
        tags: "ui,navbar", sortOrder: 10,
        description: "dropdown جدید برای About, Team, Product در navbar دسکتاپ و موبایل.",
      },
      {
        boardId: b5.id, title: "عکس‌های واقعی تیم برای صفحه About/Team",
        assignee: "Sarvenaz", priority: "LOW", status: "DONE",
        startDate: d("2026-04-05"), dueDate: d("2026-04-08"), completedAt: d("2026-04-09"),
        tags: "ui,about,team", sortOrder: 11,
        description: "آپلود و ادغام عکس‌های high-quality برای ۵ عضو تیم.",
      },
      {
        boardId: b5.id, title: "check_links.js — ابزار بررسی لینک‌های شکسته",
        assignee: "Farid", priority: "LOW", status: "DONE",
        startDate: d("2026-04-10"), dueDate: d("2026-04-12"), completedAt: d("2026-04-12"),
        tags: "qa,tools", sortOrder: 12,
        description: "اسکریپت Node.js برای crawl و بررسی همه لینک‌های سایت.",
      },
      {
        boardId: b5.id, title: "تست E2E — flows اصلی (auth, shop, jobs)",
        assignee: "Farid", priority: "HIGH", status: "DONE",
        startDate: d("2026-04-15"), dueDate: d("2026-04-25"), completedAt: d("2026-05-05"),
        tags: "testing,qa", sortOrder: 13,
        description: "تست دستی flow‌های اصلی. ۱۰ روز تاخیر به دلیل کشف باگ‌های متعدد در checkout و bid acceptance.",
      },
      {
        boardId: b5.id, title: "CHANGELOG و مستندسازی پروژه",
        assignee: "Elyas", priority: "LOW", status: "DONE",
        startDate: d("2026-05-20"), dueDate: d("2026-05-25"), completedAt: d("2026-05-26"),
        tags: "docs", sortOrder: 14,
        description: "نوشتن CHANGELOG.md و بروزرسانی README با دستورات محیطی و deployment.",
      },
      {
        boardId: b5.id, title: "بروزرسانی memory.md و AI Guidelines",
        assignee: "Farjad", priority: "MEDIUM", status: "DONE",
        startDate: d("2026-05-28"), dueDate: d("2026-06-01"), completedAt: d("2026-06-01"),
        tags: "docs,ai", sortOrder: 15,
        description: "مستند کردن قوانین کدنویسی، معماری و قوانین AI برای context همیشگی.",
      },
    ],
  });

  // ── BUGS & ISSUES Board ──────────────────────────────────────────────────
  await prisma.projectTask.createMany({
    data: [
      {
        boardId: b6.id, title: "باگ: Race condition در accept bid",
        assignee: "Farjad", priority: "CRITICAL", status: "DONE",
        startDate: d("2025-08-11"), dueDate: d("2025-08-13"), completedAt: d("2025-08-13"),
        tags: "bug,jobs,critical", sortOrder: 1,
        description: "دو welder هم‌زمان بید accept می‌شد. رفع با unique constraint روی acceptedBidId در Job.",
      },
      {
        boardId: b6.id, title: "باگ: TipTap SSR crash در Next.js",
        assignee: "Farid", priority: "HIGH", status: "DONE",
        startDate: d("2025-12-20"), dueDate: d("2025-12-22"), completedAt: d("2025-12-28"),
        tags: "bug,tiptap,ssr", sortOrder: 2,
        description: "خطای window is not defined. رفع با اضافه کردن 'use client' و dynamic import.",
      },
      {
        boardId: b6.id, title: "باگ: محاسبه غلط tax در checkout",
        assignee: "Farjad", priority: "HIGH", status: "DONE",
        startDate: d("2025-10-28"), dueDate: d("2025-10-30"), completedAt: d("2025-11-01"),
        tags: "bug,checkout,orders", sortOrder: 3,
        description: "tax دوبار اعمال می‌شد وقتی چند supplier داشتیم. رفع با refactor logic محاسبه.",
      },
      {
        boardId: b6.id, title: "باگ: SQLite data loss پس از redeploy روی Railway",
        assignee: "Reza", priority: "CRITICAL", status: "DONE",
        startDate: d("2026-03-14"), dueDate: d("2026-03-18"), completedAt: d("2026-03-22"),
        tags: "bug,railway,sqlite,critical", sortOrder: 4,
        description: "هر بار deploy دیتابیس ریست می‌شد. رفع با persistent volume و تغییر DATABASE_URL.",
      },
      {
        boardId: b6.id, title: "باگ: Middleware block کردن API routes",
        assignee: "Farjad", priority: "HIGH", status: "DONE",
        startDate: d("2025-07-05"), dueDate: d("2025-07-06"), completedAt: d("2025-07-06"),
        tags: "bug,middleware,auth", sortOrder: 5,
        description: "NextAuth middleware درخواست‌های /api را هم block می‌کرد. رفع با تنظیم صحیح matcher.",
      },
      {
        boardId: b6.id, title: "باگ: Messaging permission — کاربر بیگانه می‌توانست پیام ببیند",
        assignee: "Elyas", priority: "CRITICAL", status: "DONE",
        startDate: d("2025-08-22"), dueDate: d("2025-08-24"), completedAt: d("2025-08-26"),
        tags: "bug,messaging,security", sortOrder: 6,
        description: "بررسی authorization در API پیام‌ها. تنها customer و welder مرتبط با job می‌توانند پیام ببینند.",
      },
      {
        boardId: b6.id, title: "باگ: Cart همگام‌سازی نمی‌شد بعد از login",
        assignee: "Farjad", priority: "MEDIUM", status: "DONE",
        startDate: d("2025-10-22"), dueDate: d("2025-10-24"), completedAt: d("2025-10-24"),
        tags: "bug,cart,auth", sortOrder: 7,
        description: "بعد از login، cart icon تعداد را نشان نمی‌داد تا refresh. رفع با revalidation.",
      },
    ],
  });

  console.log("✅ Project boards and tasks seeded successfully!");
  console.log(`   Boards: 6  |  Tasks: ${9 + 10 + 10 + 13 + 15 + 7} total`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
