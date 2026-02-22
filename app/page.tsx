import prisma from "@/lib/prisma";
import { AdminSidebar } from "./components/admin-sidebar";
import {
  Library,
  Bot,
  Activity,
  Award,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Plus,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Parallel queries for dashboard stats
  const [
    templateCount,
    agentCount,
    runCount,
    certificateCount,
    runsByStatus,
    recentRuns,
    avgScoreResult,
    templatesByStatus,
  ] = await Promise.all([
    prisma.template.count(),
    prisma.agent.count(),
    prisma.run.count(),
    prisma.certificate.count(),
    prisma.run.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.run.findMany({
      take: 6,
      orderBy: { timestamp: "desc" },
      include: { agent: true, template: true },
    }),
    prisma.run.aggregate({
      _avg: { score: true },
      where: { score: { not: null } },
    }),
    prisma.template.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const statusMap: Record<string, number> = {};
  for (const s of runsByStatus) {
    statusMap[s.status] = s._count.status;
  }
  const running = statusMap["running"] ?? 0;
  const completed = statusMap["completed"] ?? 0;
  const evaluated = statusMap["evaluated"] ?? 0;

  const avgScore = avgScoreResult._avg.score
    ? Math.round(avgScoreResult._avg.score)
    : null;

  const draftTemplates =
    templatesByStatus.find((t) => t.status === "draft")?._count.status ?? 0;
  const publishedTemplates =
    templatesByStatus.find((t) => t.status === "published")?._count
      .status ?? 0;

  return (
    <div className="flex h-screen bg-[#0f131d] overflow-hidden font-sans">
      <AdminSidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden border-l border-[#1f2937]">
        {/* Page Header */}
        <div className="shrink-0 px-8 pt-8 pb-2">
          <h2 className="text-3xl font-bold text-white mb-1">
            Dashboard
          </h2>
          <p className="text-slate-400 text-sm tracking-wide">
            Overview of your interview platform activity.
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 pt-4">
          {/* ─── Stat Cards ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Library size={20} />}
              label="Templates"
              value={templateCount}
              sub={`${publishedTemplates} published · ${draftTemplates} draft`}
              accent="from-blue-500/20 to-blue-600/5"
              iconColor="text-blue-400"
              href="/templates"
            />
            <StatCard
              icon={<Bot size={20} />}
              label="Agents"
              value={agentCount}
              accent="from-violet-500/20 to-violet-600/5"
              iconColor="text-violet-400"
              href="/agents"
            />
            <StatCard
              icon={<Activity size={20} />}
              label="Interviews"
              value={runCount}
              sub={`${running} active`}
              accent="from-emerald-500/20 to-emerald-600/5"
              iconColor="text-emerald-400"
              href="/interviews"
            />
            <StatCard
              icon={<Award size={20} />}
              label="Certificates"
              value={certificateCount}
              accent="from-amber-500/20 to-amber-600/5"
              iconColor="text-amber-400"
              href="/certificates"
            />
          </div>

          {/* ─── Middle Row: Run Status + Average Score ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            {/* Run Status Breakdown */}
            <div className="lg:col-span-2 bg-[#141a2a] border border-[#1f2937] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Activity
                  size={14}
                  className="text-indigo-400"
                />
                Interview Status Breakdown
              </h3>

              {runCount > 0 ? (
                <>
                  {/* Visual bar */}
                  <div className="flex h-3 rounded-full overflow-hidden mb-5 bg-[#0f131d]">
                    {running > 0 && (
                      <div
                        className="bg-amber-500 transition-all"
                        style={{
                          width: `${(running / runCount) * 100}%`,
                        }}
                      />
                    )}
                    {completed > 0 && (
                      <div
                        className="bg-blue-500 transition-all"
                        style={{
                          width: `${(completed / runCount) * 100}%`,
                        }}
                      />
                    )}
                    {evaluated > 0 && (
                      <div
                        className="bg-emerald-500 transition-all"
                        style={{
                          width: `${(evaluated / runCount) * 100}%`,
                        }}
                      />
                    )}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-6">
                    <StatusLegend
                      color="bg-amber-500"
                      label="Running"
                      count={running}
                    />
                    <StatusLegend
                      color="bg-blue-500"
                      label="Completed"
                      count={completed}
                    />
                    <StatusLegend
                      color="bg-emerald-500"
                      label="Evaluated"
                      count={evaluated}
                    />
                  </div>
                </>
              ) : (
                <p className="text-slate-500 text-sm">
                  No interview runs yet.
                </p>
              )}
            </div>

            {/* Average Score */}
            <div className="bg-[#141a2a] border border-[#1f2937] rounded-xl p-6 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-indigo-600/5 flex items-center justify-center mb-3">
                <TrendingUp
                  size={22}
                  className="text-indigo-400"
                />
              </div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                Avg Score
              </p>
              {avgScore !== null ? (
                <p className="text-4xl font-bold text-white">
                  {avgScore}
                  <span className="text-lg text-slate-500 font-normal">
                    /100
                  </span>
                </p>
              ) : (
                <p className="text-slate-500 text-sm">
                  No data
                </p>
              )}
            </div>
          </div>

          {/* ─── Bottom Row: Recent Interviews + Quick Actions ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Recent Interviews */}
            <div className="lg:col-span-2 bg-[#141a2a] border border-[#1f2937] rounded-xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f2937]">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Clock
                    size={14}
                    className="text-slate-400"
                  />
                  Recent Interviews
                </h3>
                <Link
                  href="/interviews"
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                >
                  View all
                  <ChevronRight size={12} />
                </Link>
              </div>

              {recentRuns.length > 0 ? (
                <div className="divide-y divide-[#1f2937]">
                  {recentRuns.map((run) => (
                    <Link
                      key={run.id}
                      href={`/interviews/${run.id}`}
                      className="flex items-center justify-between px-6 py-3.5 hover:bg-[#1b253c]/40 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0">
                          <Bot
                            size={14}
                            className="text-slate-300"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium truncate">
                            {run.agent.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {run.template.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {run.score !== null && (
                          <span className="text-xs font-mono font-semibold text-white bg-[#0f131d] px-2 py-0.5 rounded">
                            {run.score}
                          </span>
                        )}
                        <RunStatusBadge
                          status={run.status}
                        />
                        <span className="text-[11px] text-slate-500 hidden sm:inline">
                          {formatDistanceToNow(
                            new Date(
                              run.timestamp
                            ),
                            { addSuffix: true }
                          )}
                        </span>
                        <ArrowUpRight
                          size={14}
                          className="text-slate-600 group-hover:text-indigo-400 transition-colors"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-10 text-center">
                  <p className="text-slate-500 text-sm">
                    No interviews yet. Create a template and
                    invite an agent to get started.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-[#141a2a] border border-[#1f2937] rounded-xl p-6 flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-white mb-2">
                Quick Actions
              </h3>
              <QuickActionLink
                href="/templates/create"
                icon={<Plus size={16} />}
                label="Create Template"
                description="Start a new evaluation template"
              />
              <QuickActionLink
                href="/templates"
                icon={<Library size={16} />}
                label="View Library"
                description="Browse your templates"
              />
              <QuickActionLink
                href="/interviews"
                icon={<Activity size={16} />}
                label="View Interviews"
                description="See all interview runs"
              />
              <QuickActionLink
                href="/agents"
                icon={<Bot size={16} />}
                label="View Agents"
                description="Manage registered agents"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
  iconColor,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  accent: string;
  iconColor: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-[#141a2a] border border-[#1f2937] rounded-xl p-5 hover:border-[#2a364d] transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center`}
        >
          <span className={iconColor}>{icon}</span>
        </div>
        <ArrowUpRight
          size={14}
          className="text-slate-600 group-hover:text-indigo-400 transition-colors"
        />
      </div>
      <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      {sub && (
        <p className="text-[11px] text-slate-500 mt-1">{sub}</p>
      )}
    </Link>
  );
}

function StatusLegend({
  color,
  label,
  count,
}: {
  color: string;
  label: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-sm text-slate-300 font-medium">{label}</span>
      <span className="text-sm text-slate-500 font-mono">{count}</span>
    </div>
  );
}

function RunStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    running: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    evaluated: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  const s = styles[status] ?? "bg-slate-500/10 text-slate-400 border-slate-500/20";
  return (
    <span
      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${s}`}
    >
      {status}
    </span>
  );
}

function QuickActionLink({
  href,
  icon,
  label,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1b253c]/50 transition-colors group"
    >
      <div className="w-9 h-9 rounded-lg bg-[#0f131d] border border-[#1f2937] flex items-center justify-center shrink-0">
        <span className="text-slate-400 group-hover:text-indigo-400 transition-colors">
          {icon}
        </span>
      </div>
      <div>
        <p className="text-sm text-white font-medium">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </Link>
  );
}
