import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ExternalLink, Search } from "lucide-react";
import { SectionHead } from "./CategoryBreakdown";
import { CONDITION_COLORS, PRIORITY_LABELS, inr, roads, wardAccent, wards, workItems, type PriorityCat } from "@/lib/ward-data";

function categoryTableMeta(cat: PriorityCat | "all") {
  switch (cat) {
    case "road":
      return {
        title: "Road",
        columns: ["Road", "Use / Rd Sign", "Dist / W", "Road Condition", "Action", "Estimation"],
      };
    case "attach":
      return {
        title: "Attachment",
        columns: ["Road", "Side", "Dist", "Type", "Width", "Condition", "Action", "Estimation"],
      };
    case "swg":
      return {
        title: "SWG",
        columns: ["Road", "Side", "Dist", "Type", "Width", "Condition", "Action", "Estimation"],
      };
    case "ugd":
      return {
        title: "UGD",
        columns: ["Road", "Dist", "Type", "Condition", "Action", "Estimation"],
      };
    case "jal":
      return {
        title: "Jalasiri",
        columns: ["Road", "Dist", "Type", "Condition", "Action", "Estimation"],
      };
    case "elec":
      return {
        title: "Electrical",
        columns: ["Road", "Dist", "Type", "Condition", "Action", "Estimation"],
      };
    default:
      return {
        title: "All categories",
        columns: ["Road", "Category", "Dist", "Condition", "Action", "Estimation"],
      };
  }
}

export function RoadRegister() {
  const [q, setQ] = useState("");
  const [ward, setWard] = useState<number | "all">("all");
  const [cond, setCond] = useState<string>("all");
  const [category, setCategory] = useState<"all" | PriorityCat>("all");

  const categoryMatches = useMemo(() => {
    const byWard = new Map<number, Set<string>>();
    for (const item of workItems) {
      if (category !== "all" && item.cat !== category) continue;
      const key = `${item.ward}|${item.area}|${item.main}|${item.cross}`.toLowerCase();
      const set = byWard.get(item.ward) ?? new Set<string>();
      set.add(key);
      byWard.set(item.ward, set);
    }
    return byWard;
  }, [category]);

  const matchesCategory = (r: (typeof roads)[number]) => {
    if (category === "all") return true;

    const wardSet = categoryMatches.get(r.w);
    if (!wardSet) return false;

    const normalized = [r.a, r.m, r.c].map((v) => v.toLowerCase());
    for (const key of wardSet) {
      const parts = key.split("|");
      if (parts.length < 4) continue;
      const [area, main, cross] = parts.slice(1);
      if (
        normalized.includes(area) ||
        normalized.includes(main) ||
        normalized.includes(cross)
      ) {
        return true;
      }
    }
    return false;
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return roads
      .filter(
        (r) =>
          (ward === "all" || r.w === ward) &&
          (cond === "all" || r.cond === cond) &&
          matchesCategory(r) &&
          (!needle ||
            r.m.toLowerCase().includes(needle) ||
            r.c.toLowerCase().includes(needle) ||
            r.a.toLowerCase().includes(needle)),
      )
      .slice(0, 60);
  }, [q, ward, cond, category, categoryMatches]);

  return (
    <section id="register" className="bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHead
          eyebrow="04 — Road register"
          title="Search the street-level record"
          sub="Highest-cost segments first. Filter by ward, condition or category, or search any road, cross or locality."
        />

        <div className="mt-10 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
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
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            className="rounded-full border bg-card px-5 py-3 text-sm outline-none focus:border-accent"
          >
            <option value="all">All categories</option>
            <option value="road">Road</option>
            <option value="ugd">UGD</option>
            <option value="swg">SWG</option>
            <option value="attach">Attachment</option>
            <option value="jal">Jalasiri</option>
            <option value="elec">Electrical</option>
          </select>
        </div>

        <div className="mt-8 space-y-3">
          {category !== "all" && (
            <div className="rounded-2xl border bg-card/70 p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {categoryTableMeta(category).title} table design
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {PRIORITY_LABELS[category]}
                </span>
              </div>
              <div className="grid gap-2 md:grid-cols-6">
                {categoryTableMeta(category).columns.map((label) => (
                  <div key={label} className="rounded-lg border bg-surface px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {filtered.map((r, i) => {
            const meta = categoryTableMeta(category);
            const categoryRow = {
              road: [
                r.m,
                r.mat || "Main Rd / Commercial / Residential / Conservancy",
                `${r.d} m / ${r.wd} m`,
                r.cond,
                "TBD",
                inr(r.cost),
              ],
              attach: [
                `${r.m} · ${r.c}`,
                "N / E",
                `${r.d} m`,
                r.mat || "Pavers",
                `${r.wd} m`,
                r.cond,
                "TBD",
                inr(r.cost),
              ],
              swg: [
                `${r.m} · ${r.c}`,
                "N / E",
                `${r.d} m`,
                r.mat || "a / b / c / d",
                `${r.wd} m`,
                r.cond,
                "TBD",
                inr(r.cost),
              ],
              ugd: [
                `${r.m} · ${r.c}`,
                `${r.d} m`,
                r.mat || "a / b / c / d",
                r.cond,
                "TBD",
                inr(r.cost),
              ],
              jal: [
                `${r.m} · ${r.c}`,
                `${r.d} m`,
                r.mat || "a / b / c / d",
                r.cond,
                "TBD",
                inr(r.cost),
              ],
              elec: [
                `${r.m} · ${r.c}`,
                `${r.d} m`,
                r.mat || "Electrical fitting",
                r.cond,
                "TBD",
                inr(r.cost),
              ],
            } as const;

            const rows = category === "all" ? categoryRow.road : categoryRow[category];

            return (
              <motion.div
                key={`${r.w}-${r.m}-${r.c}-${i}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.03 }}
                whileHover={{ x: 6 }}
                className="shadow-card rounded-2xl border bg-card p-4"
                style={{ borderLeft: `4px solid ${wardAccent(r.w)}` }}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl font-mono text-sm font-bold"
                      style={{
                        background: `color-mix(in oklab, ${wardAccent(r.w)} 16%, transparent)`,
                        color: wardAccent(r.w),
                      }}
                    >
                      {String(r.w).padStart(2, "0")}
                    </div>
                    <div>
                      <div className="font-display text-sm font-semibold">
                        {r.m} {r.c && <span className="text-muted-foreground">· {r.c}</span>}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {r.a}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
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
                </div>

                <div className="grid gap-2 md:grid-cols-6">
                  {meta.columns.map((label, idx) => (
                    <div key={`${label}-${idx}`} className="rounded-xl border bg-surface px-3 py-2">
                      <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
                      <div className="mt-1 text-sm font-medium text-foreground">
                        {idx === 0 && category !== "all" ? rows[0] : rows[idx] ?? "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
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
