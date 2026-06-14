"use client";
import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare } from "lucide-react";

type Msg = { id: string; body: string; createdAt: string; from: { id: string; name: string } };

export default function MessageThread({ jobId, myId }: { jobId: string; myId: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch(`/api/jobs/${jobId}/messages`);
    if (res.ok) setMessages(await res.json());
  }

  useEffect(() => { if (open) load(); }, [open]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/jobs/${jobId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setLoading(false);
    if (res.ok) { const m = await res.json(); setMessages((prev) => [...prev, m]); setBody(""); }
  }

  return (
    <div className="border-t border-white/10 pt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white transition-colors"
      >
        <MessageSquare size={16} />
        {open ? "Hide Messages" : "Messages"}
        {messages.length > 0 && !open && (
          <span className="ml-1 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] text-white">{messages.length}</span>
        )}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <div className="max-h-64 overflow-y-auto space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            {messages.length === 0 ? (
              <p className="text-center text-sm text-white/30 py-4">No messages yet. Start the conversation.</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.from.id === myId ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${m.from.id === myId ? "bg-red-600/20 text-white" : "bg-white/5 text-white/80"}`}>
                    {m.from.id !== myId && <div className="mb-0.5 text-[10px] font-bold text-white/40">{m.from.name}</div>}
                    <p>{m.body}</p>
                    <div className="mt-0.5 text-[10px] text-white/30 text-right">
                      {new Date(m.createdAt).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={send} className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Type a message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <button disabled={loading || !body.trim()} className="btn-primary shrink-0 px-3">
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
