import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, Bell, Camera, CheckCircle2, Gavel, MessageSquare, ShieldCheck, ShoppingCart, Smartphone, Store, UserCog,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { StoreBadge, StoreBadges } from "@/components/StoreBadges";
import { getAppLinks } from "@/lib/app-links";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HubWeld Mobile App for iPhone & Android | Download",
  description:
    "Download the HubWeld app for iPhone and Android. Post welding jobs with photos, receive bids, chat with welders, order parts and track deliveries from your phone.",
  keywords: ["HubWeld app", "HubWeld iOS", "HubWeld Android", "welding app", "welding jobs app", "welding parts app"],
  alternates: { canonical: "/app" },
};

const features = [
  { icon: Gavel, title: "Post jobs, get bids", text: "Describe the work, add site photos, and compare bids from vetted welders as they arrive." },
  { icon: MessageSquare, title: "Chat on every job", text: "Message the welder or customer inside the job thread. No phone tag, no lost details." },
  { icon: Bell, title: "Push notifications", text: "New bids, new messages, accepted bids and order updates reach you the moment they happen." },
  { icon: ShoppingCart, title: "Order parts", text: "Browse the full parts catalogue, check stock, and check out from the same cart as the website." },
  { icon: Store, title: "Run your sales", text: "Suppliers add products from the camera roll and see incoming orders on a dedicated Sales tab." },
  { icon: UserCog, title: "One account", text: "Sign in with your existing HubWeld account. Jobs, orders and your welder profile are already there." },
];

type Platform = {
  id: "ios" | "android";
  name: string;
  store: string;
  device: string;
  requirements: string[];
  steps: string[];
  permissions: { icon: typeof Camera; title: string; text: string }[];
  notes: string[];
};

const platforms: Platform[] = [
  {
    id: "ios",
    name: "iOS",
    store: "App Store",
    device: "iPhone",
    requirements: [
      "An iPhone with an up-to-date version of iOS",
      "An Apple Account signed in to the App Store",
      "Built for iPhone. On iPad it runs in iPhone mode",
    ],
    steps: [
      "Tap the App Store button on this page, or search “HubWeld” in the App Store.",
      "Tap Get, then confirm with Face ID, Touch ID or your Apple Account password.",
      "Open HubWeld and sign in with your existing account, or create one in the app.",
      "Allow notifications when asked so bids and messages reach you right away.",
    ],
    permissions: [
      { icon: Bell, title: "Notifications", text: "Asked once at first launch. Change it any time in Settings › HubWeld › Notifications." },
      { icon: Camera, title: "Camera & Photos", text: "Only asked when you attach a photo to a job, your profile or a product listing." },
    ],
    notes: [
      "Updates install automatically when App Store automatic updates are on.",
      "Delete your account from inside the app under Account › Delete account.",
    ],
  },
  {
    id: "android",
    name: "Android",
    store: "Google Play",
    device: "Android phone",
    requirements: [
      "An Android phone with a recent version of Android",
      "A Google account signed in to the Play Store",
      "Google Play services, which most phones already have",
    ],
    steps: [
      "Tap the Google Play button on this page, or search “HubWeld” in the Play Store.",
      "Tap Install and wait for the download to finish.",
      "Open HubWeld and sign in with your existing account, or create one in the app.",
      "Allow notifications when asked. Android 13 and later need this permission.",
    ],
    permissions: [
      { icon: Bell, title: "Notifications", text: "Asked once at first launch. Change it in Settings › Apps › HubWeld › Notifications." },
      { icon: Camera, title: "Camera & Photos", text: "Only asked when you attach a photo to a job, your profile or a product listing." },
    ],
    notes: [
      "Play Store keeps the app up to date automatically on Wi-Fi.",
      "Delete your account from inside the app under Account › Delete account.",
    ],
  },
];

const faqs = [
  { q: "Is the HubWeld app free?", a: "Yes. Downloading and using the app is free. You only pay for the parts you order or the work you agree with a welder." },
  { q: "Do I need a new account for the app?", a: "No. Your HubWeld website account works in the app, and everything stays in sync: jobs, bids, messages, cart and orders." },
  { q: "Can welders and suppliers use the app too?", a: "Yes. Customers post jobs and order parts, welders bid and message, and suppliers manage products and incoming orders. The app adapts its tabs to your role." },
  { q: "Can I use HubWeld without the app?", a: "Yes. Everything in the app is also available on hubweld.ca in any browser." },
];

function PhoneMock() {
  return (
    <div className="relative mx-auto hidden w-[270px] shrink-0 md:block" aria-hidden>
      <div className="rounded-[2.6rem] border border-slate-300 bg-slate-950 p-2.5 shadow-plate">
        <div className="relative flex aspect-[9/19] flex-col items-center justify-center overflow-hidden rounded-[2.1rem] bg-ink-900">
          <div className="absolute left-1/2 top-2.5 h-5 w-20 -translate-x-1/2 rounded-full bg-slate-950" />
          <Image src="/images/app-icon.png" alt="" width={96} height={96} className="rounded-[22px] shadow-plate-sm" />
          <span className="mt-5 font-display text-2xl font-bold uppercase tracking-machine text-slate-900">HubWeld</span>
          <span className="mt-1.5 font-mono text-[10px] uppercase tracking-machine text-slate-500">Jobs · Parts · Welders</span>
          <div className="absolute inset-x-0 bottom-0 h-1.5 hazard opacity-70" />
        </div>
      </div>
    </div>
  );
}

function PlatformSection({ p, href }: { p: Platform; href: string | null }) {
  return (
    <article id={p.id} className="scroll-mt-24 overflow-hidden rounded-sm border border-slate-200 bg-ink-700 shadow-plate-sm">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-ink-800 px-6 py-5 md:px-8">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-machine text-slate-500">For {p.device}</span>
          <h2 className="mt-1 font-display text-3xl font-bold uppercase leading-none tracking-tight text-slate-900 md:text-4xl">
            HubWeld for {p.name}
          </h2>
        </div>
        <StoreBadge platform={p.id} href={href} />
      </header>

      <div className="grid gap-8 px-6 py-7 md:grid-cols-2 md:px-8">
        <section>
          <h3 className="label">What you need</h3>
          <ul className="space-y-2.5">
            {p.requirements.map((r) => (
              <li key={r} className="flex items-start gap-2.5 text-sm text-slate-700">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-brand" />
                {r}
              </li>
            ))}
          </ul>

          <h3 className="label mt-7">Permissions, and why</h3>
          <div className="space-y-3">
            {p.permissions.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-brand/10 text-brand-light ring-1 ring-brand/25">
                  <Icon size={15} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{title}</div>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="label">Install in {p.steps.length} steps</h3>
          <ol className="space-y-3">
            {p.steps.map((s, i) => (
              <li key={s} className="flex items-start gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-sm bg-slate-900 font-mono text-xs font-semibold text-white tabular-nums">
                  {i + 1}
                </span>
                <p className="pt-1 text-sm leading-relaxed text-slate-700">{s}</p>
              </li>
            ))}
          </ol>

          <div className="mt-7 space-y-2 border-t border-slate-200 pt-5">
            {p.notes.map((n) => (
              <p key={n} className="text-sm leading-relaxed text-slate-500">{n}</p>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}

export default function AppPage() {
  const links = getAppLinks();

  const appLd = {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: "HubWeld",
    operatingSystem: "iOS, Android",
    applicationCategory: "BusinessApplication",
    url: `${SITE_URL}/app`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "CAD" },
    ...(links.ios || links.android ? { downloadUrl: [links.ios, links.android].filter(Boolean) } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd) }} />

      {/* ── HERO ── */}
      <section className="flex flex-col items-center gap-12 border-b border-slate-200 py-16 md:flex-row md:justify-between md:py-20">
        <div className="max-w-2xl">
          <span className="section-label"><Smartphone size={14} /> Mobile app</span>
          <h1 className="forge-rise mt-4 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight text-slate-900 md:text-7xl">
            HubWeld, <span className="text-brand-light">on the job site</span>
          </h1>
          <p className="forge-rise-2 mt-6 max-w-[52ch] text-lg leading-relaxed text-slate-700">
            Post a job from the floor with photos, answer bids between welds, and reorder consumables before you run out. Same account, same jobs, same orders as the website.
          </p>
          <StoreBadges links={links} className="forge-rise-2 mt-9" />
          <div className="forge-rise-3 mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-wider text-slate-600">
            <a href="#ios" className="inline-flex items-center gap-1.5 hover:text-brand-light">iPhone guide <ArrowRight size={12} /></a>
            <a href="#android" className="inline-flex items-center gap-1.5 hover:text-brand-light">Android guide <ArrowRight size={12} /></a>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} className="text-brand-light" /> Free to download</span>
          </div>
        </div>
        <PhoneMock />
      </section>

      {/* ── FEATURES ── */}
      <section className="pt-16">
        <Reveal>
          <h2 className="font-display text-4xl font-bold uppercase leading-none tracking-tight text-slate-900 md:text-5xl">What you can do in the app</h2>
          <div className="seam mb-8 mt-4" aria-hidden />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-sm border border-slate-200 bg-ink-700 p-6 shadow-plate-sm">
                <div className="flex items-center gap-2.5">
                  <Icon size={17} className="shrink-0 text-brand-light" />
                  <h3 className="font-display text-xl font-bold uppercase tracking-wide text-slate-900">{title}</h3>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── PLATFORMS ── */}
      <section className="space-y-8 pt-20">
        {platforms.map((p) => (
          <Reveal key={p.id}>
            <PlatformSection p={p} href={links[p.id]} />
          </Reveal>
        ))}
      </section>

      {/* ── FAQ ── */}
      <section className="pt-20">
        <Reveal>
          <h2 className="font-display text-4xl font-bold uppercase leading-none tracking-tight text-slate-900 md:text-5xl">App questions</h2>
          <div className="seam mb-8 mt-4" aria-hidden />
          <div className="overflow-hidden rounded-sm border border-slate-200 bg-ink-700 shadow-plate-sm">
            {faqs.map((f, i) => (
              <details key={f.q} className={`group px-6 py-5 ${i > 0 ? "border-t border-slate-200" : ""}`}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-slate-900 transition-colors group-open:text-brand-light [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="shrink-0 font-mono text-lg leading-none text-slate-500 transition-transform group-open:rotate-45 group-open:text-brand-light">+</span>
                </summary>
                <p className="mt-3 max-w-[75ch] text-sm leading-relaxed text-slate-700">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-sm text-slate-600">
            Prefer the browser? <Link href="/jobs/new" className="font-semibold text-brand hover:text-brand-light">Post a job on the web</Link> or{" "}
            <Link href="/shop" className="font-semibold text-brand hover:text-brand-light">browse the shop</Link>.
          </p>
        </Reveal>
      </section>
    </>
  );
}
