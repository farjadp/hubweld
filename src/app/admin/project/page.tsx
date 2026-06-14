"use client";
import { useEffect, useState, useMemo } from "react";
import {
  KanbanSquare, ChevronDown, ChevronUp, User, Calendar,
  Tag, AlertCircle, CheckCircle2, Clock, Ban, Plus, X, Save
} from "lucide-react";

type Task = {
  id: string;
  boardId: string;
  title: string;
  description: string;
  assignee: string;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  tags: string;
  sortOrder: number;
};

type Board = {
  id: string;
  title: string;
  description: string;
  color: string;
  sortOrder: number;
  tasks: Task[];
};

const TEAM = ["Farjad", "Sarvenaz", "Elyas", "Farid", "Reza"];

const STATUS_CONFIG = {
  TODO:        { label: "To Do",      bg: "bg-white/5",   border: "border-white/10", text: "text-white/60",  icon: Clock },
  IN_PROGRESS: { label: "In Progress",bg: "bg-blue-500/10",border: "border-blue-500/20",text: "text-blue-400",icon: Clock },
  DONE:        { label: "Done",       bg: "bg-green-500/10",border:"border-green-500/20",text:"text-green-400",icon: CheckCircle2 },
  BLOCKED:     { label: "Blocked",    bg: "bg-red-500/10",  border:"border-red-500/20",  text:"text-red-400",  icon: Ban },
};

const PRIORITY_CONFIG = {
  LOW:      { label: "Low",      color: "text-slate-400",  dot: "bg-slate-400" },
  MEDIUM:   { label: "Medium",   color: "text-yellow-400", dot: "bg-yellow-400" },
  HIGH:     { label: "High",     color: "text-orange-400", dot: "bg-orange-400" },
  CRITICAL: { label: "Critical", color: "text-red-400",    dot: "bg-red-500" },
};

const MEMBER_COLORS: Record<string, string> = {
  Farjad:   "bg-violet-600",
  Sarvenaz: "bg-pink-600",
  Elyas:    "bg-cyan-600",
  Farid:    "bg-emerald-600",
  Reza:     "bg-amber-600",
};

function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const bg = MEMBER_COLORS[name] ?? "bg-slate-600";
  const sz = size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs";
  return (
    <span className={`inline-flex items-center justify-center rounded-full font-bold text-white ${bg} ${sz} shrink-0`}>
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function TaskCard({ task, onStatusChange }: { task: Task; onStatusChange: (id: string, status: Task["status"]) => void }) {
  const [expanded, setExpanded] = useState(false);
  const sc = STATUS_CONFIG[task.status];
  const pc = PRIORITY_CONFIG[task.priority];
  const StatusIcon = sc.icon;
  const isLate = task.dueDate && task.status !== "DONE" && new Date(task.dueDate) < new Date();

  return (
    <div className={`rounded-xl border ${sc.border} ${sc.bg} p-3.5 transition-all hover:border-white/20`}>
      <div className="flex items-start gap-2">
        <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${pc.dot}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white/90 leading-snug">{task.title}</p>

          {expanded && task.description && (
            <p className="mt-1.5 text-xs text-white/50 leading-relaxed">{task.description}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Avatar name={task.assignee} />
            <span className={`text-[11px] font-semibold ${sc.text} flex items-center gap-1`}>
              <StatusIcon size={11} />
              {sc.label}
            </span>
            {task.dueDate && (
              <span className={`text-[11px] flex items-center gap-1 ${isLate ? "text-red-400" : "text-white/40"}`}>
                <Calendar size={10} />
                {formatDate(task.dueDate)}
                {isLate && <AlertCircle size={10} />}
              </span>
            )}
            {task.tags && task.tags.split(",").slice(0, 2).map(t => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 border border-white/5">
                {t.trim()}
              </span>
            ))}
          </div>

          {expanded && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(["TODO", "IN_PROGRESS", "DONE", "BLOCKED"] as Task["status"][]).map(s => (
                <button
                  key={s}
                  onClick={() => onStatusChange(task.id, s)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                    task.status === s
                      ? `${STATUS_CONFIG[s].border} ${STATUS_CONFIG[s].text} bg-white/10`
                      : "border-white/10 text-white/30 hover:border-white/20 hover:text-white/50"
                  }`}
                >
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => setExpanded(v => !v)} className="text-white/20 hover:text-white/50 shrink-0 mt-0.5">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
    </div>
  );
}

function BoardColumn({ board, filter, onStatusChange }: {
  board: Board;
  filter: { assignee: string; status: string };
  onStatusChange: (taskId: string, status: Task["status"]) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const tasks = useMemo(() => board.tasks.filter(t => {
    if (filter.assignee && t.assignee !== filter.assignee) return false;
    if (filter.status && t.status !== filter.status) return false;
    return true;
  }), [board.tasks, filter]);

  const done = tasks.filter(t => t.status === "DONE").length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
      {/* Board Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/8" style={{ borderTopColor: board.color, borderTopWidth: 3 }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <KanbanSquare size={15} style={{ color: board.color }} className="shrink-0" />
            <span className="text-sm font-bold text-white truncate">{board.title}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-white/40">{done}/{tasks.length}</span>
            <button onClick={() => setCollapsed(v => !v)} className="text-white/30 hover:text-white/60">
              {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-2.5 h-1 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        {!collapsed && (
          <p className="mt-2 text-[11px] text-white/35 line-clamp-2">{board.description}</p>
        )}
      </div>

      {/* Tasks */}
      {!collapsed && (
        <div className="p-3 flex flex-col gap-2 max-h-[600px] overflow-y-auto">
          {tasks.length === 0 ? (
            <p className="text-center text-xs text-white/20 py-6">No tasks</p>
          ) : (
            tasks.map(t => (
              <TaskCard key={t.id} task={t} onStatusChange={onStatusChange} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [activeView, setActiveView] = useState<"board" | "list">("board");

  useEffect(() => {
    fetch("/api/admin/project")
      .then(r => r.json())
      .then(data => { setBoards(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const allTasks = useMemo(() => boards.flatMap(b => b.tasks), [boards]);
  const stats = useMemo(() => ({
    total: allTasks.length,
    done: allTasks.filter(t => t.status === "DONE").length,
    inProgress: allTasks.filter(t => t.status === "IN_PROGRESS").length,
    blocked: allTasks.filter(t => t.status === "BLOCKED").length,
    todo: allTasks.filter(t => t.status === "TODO").length,
  }), [allTasks]);

  function handleStatusChange(taskId: string, status: Task["status"]) {
    setBoards(prev => prev.map(b => ({
      ...b,
      tasks: b.tasks.map(t => t.id === taskId ? { ...t, status } : t),
    })));
    fetch("/api/admin/project", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "task", id: taskId, status }),
    });
  }

  const filteredBoards = useMemo(() =>
    boards.filter(b => {
      const tasks = b.tasks.filter(t => {
        if (filterAssignee && t.assignee !== filterAssignee) return false;
        if (filterStatus && t.status !== filterStatus) return false;
        return true;
      });
      return tasks.length > 0;
    }),
    [boards, filterAssignee, filterStatus]
  );

  const listTasks = useMemo(() =>
    allTasks
      .filter(t => {
        if (filterAssignee && t.assignee !== filterAssignee) return false;
        if (filterStatus && t.status !== filterStatus) return false;
        return true;
      })
      .sort((a, b) => new Date(a.dueDate ?? "9999").getTime() - new Date(b.dueDate ?? "9999").getTime()),
    [allTasks, filterAssignee, filterStatus]
  );

  const getBoardTitle = (boardId: string) =>
    boards.find(b => b.id === boardId)?.title ?? "";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white/10 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <KanbanSquare size={24} className="text-red-400" />
            Project Board
          </h1>
          <p className="text-sm text-white/40 mt-1">
            HubWeld Project Management — Jun 2025 to Jun 2026
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView("board")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              activeView === "board"
                ? "bg-red-600/15 text-red-400 border-red-600/20"
                : "bg-white/5 text-white/50 border-white/10 hover:text-white"
            }`}
          >
            Board
          </button>
          <button
            onClick={() => setActiveView("list")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              activeView === "list"
                ? "bg-red-600/15 text-red-400 border-red-600/20"
                : "bg-white/5 text-white/50 border-white/10 hover:text-white"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-white", bg: "bg-white/5" },
          { label: "Done", value: stats.done, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "In Progress", value: stats.inProgress, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "To Do", value: stats.todo, color: "text-white/60", bg: "bg-white/5" },
          { label: "Blocked", value: stats.blocked, color: "text-red-400", bg: "bg-red-500/10" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border border-white/8 ${s.bg} px-4 py-3`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress Overall */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white/70">پیشرفت کلی پروژه</span>
          <span className="text-sm font-black text-green-400">
            {stats.total ? Math.round((stats.done / stats.total) * 100) : 0}%
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400 transition-all"
            style={{ width: `${stats.total ? Math.round((stats.done / stats.total) * 100) : 0}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {TEAM.map(name => {
            const memberTasks = allTasks.filter(t => t.assignee === name);
            const memberDone = memberTasks.filter(t => t.status === "DONE").length;
            return (
              <button
                key={name}
                onClick={() => setFilterAssignee(filterAssignee === name ? "" : name)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                  filterAssignee === name
                    ? "border-white/30 bg-white/10 text-white"
                    : "border-white/8 bg-white/3 text-white/50 hover:text-white/80"
                }`}
              >
                <Avatar name={name} />
                <span>{name}</span>
                <span className="text-white/30">{memberDone}/{memberTasks.length}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-xs text-white/30 font-semibold uppercase tracking-wider">Filter:</span>
        <div className="flex gap-2">
          {(["", "TODO", "IN_PROGRESS", "DONE", "BLOCKED"] as const).map(s => (
            <button
              key={s || "all"}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                filterStatus === s
                  ? "bg-red-600/15 text-red-400 border-red-600/20"
                  : "bg-white/3 text-white/40 border-white/8 hover:text-white/60"
              }`}
            >
              {s ? STATUS_CONFIG[s].label : "All"}
            </button>
          ))}
        </div>
        {(filterAssignee || filterStatus) && (
          <button
            onClick={() => { setFilterAssignee(""); setFilterStatus(""); }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-white/40 border border-white/8 hover:text-white/70 transition-colors"
          >
            <X size={11} /> Clear
          </button>
        )}
      </div>

      {/* BOARD VIEW */}
      {activeView === "board" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {(filterAssignee || filterStatus ? filteredBoards : boards).map(board => (
            <BoardColumn
              key={board.id}
              board={board}
              filter={{ assignee: filterAssignee, status: filterStatus }}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* LIST VIEW */}
      {activeView === "list" && (
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-xs text-white/30 uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-semibold">Task</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Phase</th>
                <th className="text-left px-4 py-3 font-semibold">Assignee</th>
                <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Priority</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {listTasks.map(task => {
                const sc = STATUS_CONFIG[task.status];
                const pc = PRIORITY_CONFIG[task.priority];
                const isLate = task.dueDate && task.status !== "DONE" && new Date(task.dueDate) < new Date();
                return (
                  <tr key={task.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${pc.dot}`} />
                        <span className="text-white/80 font-medium line-clamp-1">{task.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-white/35 text-xs line-clamp-1">{getBoardTitle(task.boardId)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Avatar name={task.assignee} />
                        <span className="text-white/50 text-xs hidden sm:inline">{task.assignee}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs font-semibold ${pc.color}`}>{pc.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${sc.text}`}>{sc.label}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs ${isLate ? "text-red-400" : "text-white/35"}`}>
                        {formatDate(task.dueDate) ?? "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {listTasks.length === 0 && (
            <p className="text-center text-sm text-white/20 py-12">No results found</p>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
        <h2 className="text-sm font-bold text-white/70 mb-4 flex items-center gap-2">
          <Calendar size={14} className="text-red-400" />
          Project Timeline (Jun 2025 — Jun 2026)
        </h2>
        <div className="flex gap-0 overflow-x-auto pb-2">
          {[
            { month: "Jun'25", phase: "Foundation", color: "#6366f1", pct: 100 },
            { month: "Jul'25", phase: "Foundation", color: "#6366f1", pct: 100 },
            { month: "Aug'25", phase: "Service MP", color: "#0ea5e9", pct: 100 },
            { month: "Sep'25", phase: "Service MP", color: "#0ea5e9", pct: 100 },
            { month: "Oct'25", phase: "B2B Shop",   color: "#f59e0b", pct: 100 },
            { month: "Nov'25", phase: "B2B Shop",   color: "#f59e0b", pct: 100 },
            { month: "Dec'25", phase: "Admin/Blog", color: "#10b981", pct: 100 },
            { month: "Jan'26", phase: "Admin/Blog", color: "#10b981", pct: 100 },
            { month: "Feb'26", phase: "Polish",     color: "#ef4444", pct: 100 },
            { month: "Mar'26", phase: "Deploy",     color: "#ef4444", pct: 100 },
            { month: "Apr'26", phase: "Deploy",     color: "#ef4444", pct: 100 },
            { month: "Jun'26", phase: "Done ✓",     color: "#22c55e", pct: 100 },
          ].map((m, i) => (
            <div key={i} className="flex flex-col items-center min-w-[72px] gap-1.5">
              <div className="w-full h-7 rounded-md flex items-center justify-center text-[9px] font-bold text-white/80"
                style={{ backgroundColor: m.color + "22", border: `1px solid ${m.color}44` }}>
                {m.phase}
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/5">
                <div className="h-full rounded-full" style={{ width: `${m.pct}%`, backgroundColor: m.color }} />
              </div>
              <span className="text-[10px] text-white/30">{m.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
