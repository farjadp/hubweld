import type { AppLinks } from "@/lib/app-links";

function AppleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.37 12.6c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.76 2.28-1.6 2.78-.41 6.9 1.15 9.16.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.24-.02 2.02-1.12 2.77-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.42-3.65zM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.01.61-2.66 1.37-.58.67-1.1 1.76-.96 2.8 1.01.08 2.05-.52 2.68-1.28z" />
    </svg>
  );
}

function PlayMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M3.6 2.3 13.5 12l-9.9 9.7c-.35-.2-.6-.6-.6-1.1V3.4c0-.5.25-.9.6-1.1z" fill="#34A853" />
      <path d="m16.8 8.7-3.3 3.3-9.9-9.7c.3-.2.8-.2 1.2 0l12 6.4z" fill="#FBBC04" />
      <path d="m16.8 15.3-12 6.4c-.4.2-.9.2-1.2 0l9.9-9.7 3.3 3.3z" fill="#EA4335" />
      <path d="M20.4 12c0 .5-.3 1-.8 1.2l-2.8 2.1-3.3-3.3 3.3-3.3 2.8 2.1c.5.2.8.7.8 1.2z" fill="#4285F4" />
    </svg>
  );
}

type Platform = "ios" | "android";

const copy: Record<Platform, { kicker: string; store: string }> = {
  ios: { kicker: "Download on the", store: "App Store" },
  android: { kicker: "Get it on", store: "Google Play" },
};

export function StoreBadge({ platform, href }: { platform: Platform; href: string | null }) {
  const { kicker, store } = copy[platform];
  const Mark = platform === "ios" ? AppleMark : PlayMark;
  const body = (
    <>
      <Mark className="h-7 w-7 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="text-[10px] font-medium tracking-wide opacity-80">{href ? kicker : "Coming soon to"}</span>
        <span className="mt-1 text-lg font-semibold tracking-tight">{store}</span>
      </span>
    </>
  );

  const base = "inline-flex h-14 min-w-[180px] items-center gap-3 rounded-md px-4 transition-colors";

  if (!href) {
    return (
      <span aria-disabled className={`${base} cursor-default border border-slate-300 bg-ink-800 text-slate-500`}>
        {body}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} bg-slate-950 text-white shadow-plate-sm hover:bg-slate-800`}
    >
      {body}
    </a>
  );
}

export function StoreBadges({ links, className = "" }: { links: AppLinks; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <StoreBadge platform="ios" href={links.ios} />
      <StoreBadge platform="android" href={links.android} />
    </div>
  );
}
