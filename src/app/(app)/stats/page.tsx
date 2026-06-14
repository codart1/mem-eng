"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { Flame, TrendingUp, History, GraduationCap, BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllCards, useAllLogs } from "@/lib/hooks/use-data";
import {
  currentStreak,
  retentionRate,
  reviewsByDay,
  dueForecast,
  stateBreakdown,
} from "@/lib/stats";
import { State } from "ts-fsrs";

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  fontSize: "0.8rem",
  color: "var(--popover-foreground)",
};

export default function StatsPage() {
  const cards = useAllCards();
  const logs = useAllLogs();

  const history = useMemo(() => (logs ? reviewsByDay(logs, 30) : []), [logs]);
  const forecast = useMemo(() => (cards ? dueForecast(cards, 14) : []), [cards]);
  const breakdown = useMemo(
    () => (cards ? stateBreakdown(cards) : { new: 0, learning: 0, review: 0 }),
    [cards],
  );
  const streak = useMemo(() => (logs ? currentStreak(logs) : 0), [logs]);
  const retention = useMemo(() => (logs ? retentionRate(logs) : 0), [logs]);

  if (cards === undefined || logs === undefined) {
    return (
      <div className="space-y-6">
        <PageHeader title="Stats" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (logs.length === 0 && cards.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Stats" />
        <EmptyState
          icon={BarChart3}
          title="No data yet"
          description="Once you start studying, your progress and forecast will show up here."
        />
      </div>
    );
  }

  const mature = cards.filter((c) => c.fsrs.state === State.Review).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stats"
        description="Track your reviews, retention, and what's coming up."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total reviews"
          value={logs.length}
          icon={History}
          accent="var(--brand)"
        />
        <StatCard
          label="Mature cards"
          value={mature}
          icon={GraduationCap}
          accent="var(--rating-good)"
        />
        <StatCard
          label="Day streak"
          value={streak}
          icon={Flame}
          accent="var(--amber)"
        />
        <StatCard
          label="Retention"
          value={`${Math.round(retention * 100)}%`}
          icon={TrendingUp}
          accent="var(--rating-easy)"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reviews — last 30 days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  interval={4}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="count" name="Reviews" fill="var(--brand)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Due forecast — next 14 days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecast} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    interval={1}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="count" name="Due" radius={[4, 4, 0, 0]}>
                    {forecast.map((d, i) => (
                      <Cell
                        key={d.date}
                        fill={i === 0 ? "var(--rating-good)" : "var(--chart-2)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Card maturity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <MaturityRow label="New" value={breakdown.new} total={cards.length} color="var(--brand)" />
            <MaturityRow
              label="Learning"
              value={breakdown.learning}
              total={cards.length}
              color="var(--rating-hard)"
            />
            <MaturityRow
              label="Review"
              value={breakdown.review}
              total={cards.length}
              color="var(--rating-good)"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MaturityRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
          {label}
        </span>
        <span className="text-muted-foreground tabular-nums">{value}</span>
      </div>
      <div className="bg-muted h-1.5 overflow-hidden rounded-full">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
