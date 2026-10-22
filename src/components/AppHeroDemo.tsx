"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Bell, Briefcase, Camera, Check, Home, MapPin, PackageCheck, Send, ShoppingCart, Star, Store, Truck, User,
} from "lucide-react";

/**
 * Looping walkthrough of the mobile app for the /app hero. Each scene remounts
 * on change (keyed), so its staged CSS animations replay from the start.
 * Must match the `fill` animation duration in tailwind.config.ts.
 */
const SCENE_MS = 4600;

type Tab = "home" | "jobs" | "shop" | "cart" | "account";

const scenes: { label: string; title: string; tab: Tab }[] = [
  { label: "Post a job", title: "New job", tab: "jobs" },
  { label: "Get bids", title: "Pipe repair · Unit 4", tab: "jobs" },
  { label: "Chat", title: "Marco R.", tab: "jobs" },
  { label: "Order parts", title: "Shop", tab: "shop" },
];

/** Finger tap: a ripple that fires once at its delay. */
function Tap({ className }: { className: string }) {
  return <span className={`demo-anim pointer-events-none absolute h-10 w-10 motion-reduce:hidden rounded-full bg-brand/40 opacity-0 animate-tap ${className}`} aria-hidden />;
}

function PostJobScene() {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div>
        <div className="font-mono text-[9px] uppercase tracking-machine text-slate-500">Title</div>
        <div className="mt-1 rounded-sm border border-brand/60 bg-white px-2.5 py-2 text-[12px] font-medium text-slate-900">
          <span className="demo-anim inline-block overflow-hidden whitespace-nowrap border-r-2 border-brand align-bottom animate-[type_1100ms_steps(20,end)_200ms_both,caret_800ms_step-end_infinite]">
            Pipe repair — Unit 4
          </span>
        </div>
      </div>
      <div className="demo-anim animate-rise-in [animation-delay:1300ms]">
        <div className="font-mono text-[9px] uppercase tracking-machine text-slate-500">Location</div>
        <div className="mt-1 flex items-center gap-1.5 rounded-sm border border-slate-200 bg-white px-2.5 py-2 text-[12px] text-slate-700">
          <MapPin size={11} className="text-brand" /> Newmarket, ON
        </div>
      </div>
      <div>
        <div className="font-mono text-[9px] uppercase tracking-machine text-slate-500">Site photos</div>
        <div className="mt-1 grid grid-cols-3 gap-1.5">
          <div className="demo-anim relative aspect-square overflow-hidden rounded-sm animate-pop-in [animation-delay:1700ms]">
            <Image src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=200&q=60" alt="" fill className="object-cover" unoptimized />
          </div>
          <div className="demo-anim relative aspect-square overflow-hidden rounded-sm animate-pop-in [animation-delay:2000ms]">
            <Image src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&q=60" alt="" fill className="object-cover" unoptimized />
          </div>
          <div className="grid aspect-square place-items-center rounded-sm border border-dashed border-slate-300 text-slate-400">
            <Camera size={14} />
          </div>
        </div>
      </div>
      <div className="relative mt-auto">
        <div className="relative grid h-9 place-items-center overflow-hidden rounded-sm bg-brand text-[12px] font-bold uppercase tracking-machine text-white shadow-ember">
          <span className="demo-anim animate-fade-out [animation-delay:3100ms]">Post job</span>
          <span className="demo-anim absolute inset-0 flex items-center justify-center gap-1.5 bg-green-600 opacity-0 animate-pop-in [animation-delay:3200ms]">
            <Check size={13} /> Posted
          </span>
        </div>
        <Tap className="left-1/2 top-1/2 -ml-5 -mt-5 [animation-delay:2900ms]" />
      </div>
    </div>
  );
}

const bids = [
  { name: "Marco R.", initials: "MR", price: "$1,250", rating: "4.9", delay: "[animation-delay:500ms]" },
  { name: "Steelline Fab", initials: "SF", price: "$1,480", rating: "4.7", delay: "[animation-delay:1300ms]" },
  { name: "Dana K.", initials: "DK", price: "$1,390", rating: "4.8", delay: "[animation-delay:2000ms]" },
];

function BidsScene() {
  return (
    <div className="relative flex h-full flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <span className="rounded-sm border border-green-500/30 bg-green-500/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-green-700">Open</span>
        <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">3 bids</span>
      </div>
      {bids.map((b, i) => (
        <div key={b.name} className={`demo-anim relative flex items-center gap-2.5 rounded-sm border border-slate-200 bg-white p-2.5 shadow-plate-sm animate-rise-in ${b.delay}`}>
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-sm bg-slate-900 font-mono text-[10px] font-bold text-white">{b.initials}</span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-semibold text-slate-900">{b.name}</div>
            <div className="flex items-center gap-0.5 text-[10px] text-slate-500">
              <Star size={9} className="fill-amber-400 text-amber-400" /> {b.rating}
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-[15px] font-bold tabular-nums text-slate-900">{b.price}</div>
            {i === 0 && (
              <div className="relative mt-0.5 h-5">
                <span className="demo-anim block rounded-sm bg-brand px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white animate-fade-out [animation-delay:3300ms]">Accept</span>
                <span className="demo-anim absolute inset-0 flex items-center justify-center gap-0.5 rounded-sm bg-green-600 text-[9px] font-bold uppercase tracking-wider text-white opacity-0 animate-pop-in [animation-delay:3400ms]">
                  <Check size={9} /> Done
                </span>
                <Tap className="-right-2 -top-2 [animation-delay:3100ms]" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatScene() {
  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex flex-1 flex-col justify-end gap-2">
        <div className="demo-anim max-w-[80%] self-start rounded-md rounded-bl-none bg-white px-3 py-2 text-[12px] text-slate-800 shadow-plate-sm animate-rise-in [animation-delay:300ms]">
          I can be on site tomorrow at 8.
        </div>
        <div className="demo-anim max-w-[80%] self-end rounded-md rounded-br-none bg-brand px-3 py-2 text-[12px] text-white animate-rise-in [animation-delay:1300ms]">
          Perfect. Gate code is 4471.
        </div>
        {/* Typing dots sit where the reply lands, then hand over to it. */}
        <div className="relative max-w-[80%] self-start">
          <div className="demo-anim rounded-md rounded-bl-none bg-white px-3 py-2 text-[12px] text-slate-800 shadow-plate-sm animate-rise-in [animation-delay:3100ms]">
            See you then. Bringing the TIG rig.
          </div>
          <div className="demo-anim absolute bottom-0 left-0 flex gap-1 motion-reduce:hidden rounded-md rounded-bl-none bg-white px-3 py-2.5 shadow-plate-sm animate-[rise-in_400ms_ease-out_2100ms_both,fade-out_200ms_ease-out_3000ms_both]">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-dot-pulse" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-dot-pulse [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-dot-pulse [animation-delay:300ms]" />
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-sm border border-slate-200 bg-white px-2.5 py-2">
        <span className="flex-1 text-[11px] text-slate-400">Message…</span>
        <Send size={13} className="text-brand" />
      </div>
    </div>
  );
}

function OrderScene() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden p-4">
      <div className="demo-anim overflow-hidden rounded-sm border border-slate-200 bg-white shadow-plate-sm animate-rise-in [animation-delay:150ms]">
        <div className="relative h-28 bg-ink-800">
          <Image src="/images/products/7018-stick-electrodes.webp" alt="" fill className="object-contain p-2" />
        </div>
        <div className="p-3">
          <div className="font-mono text-[9px] uppercase tracking-machine text-slate-500">Electrodes</div>
          <div className="mt-0.5 text-[12px] font-semibold leading-snug text-slate-900">7018 Stick Electrodes</div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="font-display text-lg font-bold tabular-nums text-slate-900">$48.90</span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-green-700">In stock</span>
          </div>
          <div className="relative mt-2.5">
            <div className="relative grid h-8 place-items-center overflow-hidden rounded-sm bg-slate-900 text-[11px] font-bold uppercase tracking-machine text-white">
              <span className="demo-anim flex items-center gap-1.5 animate-fade-out [animation-delay:1300ms]"><ShoppingCart size={12} /> Add to cart</span>
              <span className="demo-anim absolute inset-0 flex items-center justify-center gap-1.5 bg-green-600 opacity-0 animate-pop-in [animation-delay:1400ms]">
                <Check size={12} /> Added
              </span>
            </div>
            <Tap className="left-1/2 top-1/2 -ml-5 -mt-5 [animation-delay:1100ms]" />
          </div>
        </div>
      </div>

      <div className="demo-anim absolute inset-x-0 bottom-0 translate-y-full rounded-t-xl border-t border-slate-200 bg-white px-4 pb-5 pt-4 shadow-plate animate-sheet-up [animation-delay:2500ms]">
        <div className="mx-auto mb-3 h-1 w-8 rounded-full bg-slate-300" />
        <div className="flex items-center gap-3">
          <span className="demo-anim grid h-9 w-9 place-items-center rounded-full bg-green-600 text-white animate-pop-in [animation-delay:2900ms]">
            <PackageCheck size={17} />
          </span>
          <div>
            <div className="text-[13px] font-bold text-slate-900">Order placed</div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500">#HW-2041 · Ships tomorrow</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const tabs: { id: Tab; icon: typeof Home; label: string }[] = [
  { id: "home", icon: Home, label: "Home" },
  { id: "jobs", icon: Briefcase, label: "Jobs" },
  { id: "shop", icon: Store, label: "Shop" },
  { id: "cart", icon: ShoppingCart, label: "Cart" },
  { id: "account", icon: User, label: "Account" },
];

export function AppHeroDemo() {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setScene((s) => (s + 1) % scenes.length), SCENE_MS);
    return () => clearTimeout(t);
  }, [scene]);

  const current = scenes[scene];

  return (
    <div className="relative mx-auto w-[260px] shrink-0 md:w-[280px]">
      {/* Sparks around the phone */}
      <span className="demo-anim absolute -left-6 top-10 h-3 w-3 rotate-45 bg-brand-light animate-spark" aria-hidden />
      <span className="demo-anim absolute -right-4 top-1/3 h-2 w-2 rotate-45 bg-amber-400 animate-spark [animation-delay:500ms]" aria-hidden />
      <span className="demo-anim absolute -left-3 bottom-32 h-2 w-2 rotate-45 bg-amber-400 animate-spark [animation-delay:1000ms]" aria-hidden />

      {/* Floating status chips (desktop only, they sit outside the phone) */}
      <div className="demo-anim absolute -left-40 top-24 z-10 hidden items-center gap-2 rounded-sm border border-slate-200 bg-white px-3 py-2 shadow-plate animate-float lg:flex" aria-hidden>
        <Bell size={14} className="text-brand" />
        <div className="leading-tight">
          <div className="text-[11px] font-semibold text-slate-900">New bid</div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500">$1,250 · 2 min ago</div>
        </div>
      </div>
      <div className="demo-anim absolute -left-36 bottom-28 z-10 hidden items-center gap-2 rounded-sm border border-slate-200 bg-white px-3 py-2 shadow-plate animate-float [animation-delay:2500ms] lg:flex" aria-hidden>
        <Truck size={14} className="text-green-600" />
        <div className="leading-tight">
          <div className="text-[11px] font-semibold text-slate-900">Order shipped</div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Arrives Thu</div>
        </div>
      </div>

      {/* Phone */}
      <div className="relative rounded-[2.6rem] border border-slate-300 bg-slate-950 p-2.5 shadow-plate" role="img" aria-label={`HubWeld app demo: ${current.label}`}>
        <div className="relative flex aspect-[9/19] flex-col overflow-hidden rounded-[2.1rem] bg-ink-900">
          {/* Status bar + notch */}
          <div className="flex h-8 shrink-0 items-center justify-between px-6 pt-1 font-mono text-[10px] font-semibold text-slate-900">
            <span>9:41</span>
            <span className="tracking-tighter">●●●</span>
          </div>
          <div className="absolute left-1/2 top-2.5 h-5 w-20 -translate-x-1/2 rounded-full bg-slate-950" />

          {/* Push notification for the bids scene */}
          {scene === 1 && (
            <div className="demo-anim absolute inset-x-2 top-9 z-20 flex items-center gap-2.5 rounded-xl bg-white/95 p-2.5 shadow-plate animate-notify-drop [animation-delay:200ms]">
              <Image src="/images/app-icon.png" alt="" width={26} height={26} className="rounded-md" />
              <div className="min-w-0 leading-tight">
                <div className="text-[11px] font-bold text-slate-900">New bid on your job</div>
                <div className="truncate text-[10px] text-slate-600">Marco R. bid $1,250 · Pipe repair</div>
              </div>
            </div>
          )}

          {/* App header */}
          <div className="flex h-10 shrink-0 items-center border-b border-slate-200 px-4">
            <span key={current.title} className="demo-anim truncate font-display text-[15px] font-bold uppercase tracking-wide text-slate-900 animate-rise-in">
              {current.title}
            </span>
          </div>

          {/* Scene */}
          <div key={scene} className="relative min-h-0 flex-1 bg-ink-800">
            {scene === 0 && <PostJobScene />}
            {scene === 1 && <BidsScene />}
            {scene === 2 && <ChatScene />}
            {scene === 3 && <OrderScene />}
          </div>

          {/* Tab bar */}
          <div className="grid shrink-0 grid-cols-5 border-t border-slate-200 bg-white px-1 pb-3 pt-1.5">
            {tabs.map(({ id, icon: Icon, label }) => {
              const active = current.tab === id;
              return (
                <div key={id} className={`relative flex flex-col items-center gap-0.5 transition-colors duration-300 ${active ? "text-brand" : "text-slate-400"}`}>
                  <Icon size={15} />
                  <span className="text-[8px] font-medium">{label}</span>
                  {id === "cart" && scene === 3 && (
                    <span className="demo-anim absolute -top-1 right-2 grid h-3.5 min-w-[14px] place-items-center rounded-full bg-brand px-1 font-mono text-[8px] font-bold text-white animate-pop-in [animation-delay:1500ms]">
                      1
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 hazard opacity-60" aria-hidden />
        </div>
      </div>

      {/* Scene picker with per-scene progress */}
      <div className="mt-5 grid grid-cols-4 gap-2">
        {scenes.map((s, i) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setScene(i)}
            className={`text-left font-mono text-[9px] uppercase tracking-wider transition-colors ${i === scene ? "text-slate-900" : "text-slate-400 hover:text-slate-700"}`}
          >
            <span className="mb-1.5 block h-[3px] overflow-hidden rounded-full bg-slate-200">
              {i === scene && <span key={scene} className="block h-full origin-left bg-brand animate-fill" />}
              {i < scene && <span className="block h-full bg-brand/40" />}
            </span>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
