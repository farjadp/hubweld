"use client";
import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare } from "lucide-react";
import { mutate, errorMessage } from "@/lib/api";

type Msg = { id: string; body: string; createdAt: string; from: { id: string; name: string } };

export default function MessageThread({ jobId, myId }: { jobId: string; myId: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
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
    setErr("");
    try {
      const m = await mutate<Msg>(`/api/jobs/${jobId}/messages`, { body: { body } });
      setMessages((prev) => [...prev, m]);
      setBody("");
    } catch (e) {
      setErr(errorMessage(e, "Message not sent"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-t border-slate-200 pt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors"
      >
        <MessageSquare size={16} />
        {open ? "Hide Messages" : "Messages"}
        {messages.length > 0 && !open && (
          <span className="ml-1 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] text-white">{messages.length}</span>
        )}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <div className="max-h-64 overflow-y-auto space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            {messages.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-4">No messages yet. Start the conversation.</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.from.id === myId ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${m.from.id === myId ? "bg-red-600/20 text-white" : "bg-slate-100 text-slate-700"}`}>
                    {m.from.id !== myId && <div className="mb-0.5 text-[10px] font-bold text-slate-500">{m.from.name}</div>}
                    <p>{m.body}</p>
                    <div className="mt-0.5 text-[10px] text-slate-400 text-right">
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
          {err && <p className="text-xs text-brand">{err}</p>}
        </div>
      )}
    </div>
  );
}
