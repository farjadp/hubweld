"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type WelderProfile = {
  bio: string; skills: string; certifications: string;
  serviceArea: string; hourlyRate: number; yearsExp: number;
};

type Initial = {
  name: string | null; email: string | null; city: string; role: string;
  welderProfile: WelderProfile | null;
};

export default function AdminUserEditForm({ userId, initial }: { userId: string; initial: Initial }) {
  const router = useRouter();
  const [name, setName] = useState(initial.name ?? "");
  const [email, setEmail] = useState(initial.email ?? "");
  const [city, setCity] = useState(initial.city);
  const [profile, setProfile] = useState<WelderProfile>(initial.welderProfile ?? {
    bio: "", skills: "", certifications: "", serviceArea: "", hourlyRate: 0, yearsExp: 0,
  });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function setP<K extends keyof WelderProfile>(k: K, v: WelderProfile[K]) {
    setProfile((p) => ({ ...p, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null); setSuccess(false);
    const body: any = { name, email, city };
    if (initial.role === "WELDER") body.profile = profile;
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setErr(d.error || "Failed to save"); return; }
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Basic info */}
      <div className="card space-y-4">
        <h2 className="font-bold text-slate-900">Basic Info</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="label">Full name</label><input className="input" required value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="label">Email</label><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label className="label">City</label><input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Toronto" /></div>
          <div><label className="label">Role</label><input className="input opacity-50 cursor-not-allowed" value={initial.role} disabled /></div>
        </div>
      </div>

      {/* Welder profile */}
      {initial.role === "WELDER" && (
        <div className="card space-y-4">
          <h2 className="font-bold text-slate-900">Welder Profile</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="label">Bio</label>
              <textarea className="input min-h-24" value={profile.bio} onChange={(e) => setP("bio", e.target.value)} placeholder="Welder's professional bio..." />
            </div>
            <div>
              <label className="label">Skills (comma-separated)</label>
              <input className="input" value={profile.skills} onChange={(e) => setP("skills", e.target.value)} placeholder="TIG,MIG,Stick,Pipe" />
            </div>
            <div>
              <label className="label">Certifications</label>
              <input className="input" value={profile.certifications} onChange={(e) => setP("certifications", e.target.value)} placeholder="AWS, CWB" />
            </div>
            <div>
              <label className="label">Service Area</label>
              <input className="input" value={profile.serviceArea} onChange={(e) => setP("serviceArea", e.target.value)} placeholder="Greater Toronto Area" />
            </div>
            <div>
              <label className="label">Hourly Rate ($/hr)</label>
              <input className="input" type="number" min="0" value={profile.hourlyRate} onChange={(e) => setP("hourlyRate", Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Years of Experience</label>
              <input className="input" type="number" min="0" value={profile.yearsExp} onChange={(e) => setP("yearsExp", Number(e.target.value))} />
            </div>
          </div>
        </div>
      )}

      {err && <p className="text-sm text-brand">{err}</p>}
      {success && <p className="text-sm text-green-700">Saved successfully!</p>}

      <div className="flex gap-3">
        <button type="button" onClick={() => router.push("/admin/users")} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
