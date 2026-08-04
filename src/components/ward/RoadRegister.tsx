import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ExternalLink, Search } from "lucide-react";
import { SectionHead } from "./CategoryBreakdown";
import { CONDITION_COLORS, inr, roads, wardAccent, wards } from "@/lib/ward-data";

export function RoadRegister() {
  const [q, setQ] = useState("");
  const [ward, setWard] = useState<number | "all">("all");
  const [cond, setCond] = useState<string>("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return roads
      .filter(
        (r) =>
          (ward === "all" || r.w === ward) &&
          (cond === "all" || r.cond === cond) &&
          (!needle ||
            r.m.toLowerCase().includes(needle) ||
            r.c.toLowerCase().includes(needle) ||
            r.a.toLowerCase().includes(needle)),
      )
      .slice(0, 60);
  }, [q, ward, cond]);

  return (
    <section id="register" className="bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHead
          eyebrow="04 — Road register"
          title="Search the street-level record"
          sub="Highest-cost segments first. Filter by ward or condition, or search any road, cross or locality."
        />

        <div className="mt-10 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search road, cross or locality…"
              className="w-full rounded-full border bg-card py-3 pl-11 pr-4 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <select
            value={ward}
            onChange={(e) => setWard(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="rounded-full border bg-card px-5 py-3 text-sm outline-none focus:border-accent"
          >
            <option value="all">All wards</option>
            {wards.map((w) => (
              <option key={w.ward} value={w.ward}>
                Ward {String(w.ward).padStart(2, "0")} — {w.name}
              </option>
            ))}
          </select>
          <select
            value={cond}
            onChange={(e) => setCond(e.target.value)}
            className="rounded-full border bg-card px-5 py-3 text-sm outline-none focus:border-accent"
          >
            {["all", "Good", "Maintenance", "Required", "Unknown"].map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All conditions" : c}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8 space-y-3">
          {filtered.map((r, i) => (
            <motion.div
              key={`${r.w}-${r.m}-${r.c}-${i}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.03 }}
              whileHover={{ x: 6 }}
              className="shadow-card grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border bg-card p-4"
              style={{ borderLeft: `4px solid ${wardAccent(r.w)}` }}
            >
              <div
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl font-mono text-sm font-bold"
                style={{
                  background: `color-mix(in oklab, ${wardAccent(r.w)} 16%, transparent)`,
                  color: wardAccent(r.w),
                }}
              >
                {String(r.w).padStart(2, "0")}
              </div>
              <div className="min-w-0">
                <div className="truncate font-display text-sm font-semibold">
                  {r.m} {r.c && <span className="text-muted-foreground">· {r.c}</span>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10.5px] text-muted-foreground">
                  <span>{r.a}</span>
                  <span>{r.mat || "—"}</span>
                  <span>
                    {r.d} m × {r.wd} m
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5"
                    style={{
                      background: `color-mix(in oklab, ${CONDITION_COLORS[r.cond]} 15%, transparent)`,
                      color: CONDITION_COLORS[r.cond],
                    }}
                  >
                    {r.cond}
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-mono text-sm font-bold">{inr(r.cost)}</div>
                {r.map && (
                  <a
                    href={r.map}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-accent"
                  >
                    Map <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
              No segments match that search.
            </div>
          )}
        </div>
        <p className="mt-6 text-center font-mono text-[11px] text-muted-foreground">
          Showing top {filtered.length} of {roads.length.toLocaleString("en-IN")} surveyed segments
        </p>
      </div>
    </section>
  );
}
