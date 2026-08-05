import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, ArrowLeft, ChevronDown, ExternalLink } from "lucide-react";
import { SectionHead } from "./CategoryBreakdown";
import { CountUp } from "./CountUp";
import { RoadDetailDialog } from "./RoadDetailDialog";
import {
  CONDITION_COLORS,
  CONDITION_KEYS,
  COST_COLORS,
  PRIORITY_CATS,
  PRIORITY_LABELS,
  findRoad,
  inr,
  priority,
  priorityByWard,
  wardAccent,
  wards,
  workItemsByWard,
  type ConditionKey,
  type PriorityCat,
  type Road,
} from "@/lib/ward-data";

export function PriorityWorks() {
  const [open, setOpen] = useState(false);
  const [selectedWard, setSelectedWard] = useState<number | null>(null);
  const [catFilter, setCatFilter] = useState<PriorityCat | "all">("all");
  const [condFilter, setCondFilter] = useState<Set<ConditionKey>>(() => new Set<ConditionKey>(["Required"]));
  const [selectedRoad, setSelectedRoad] = useState<Road | null>(null);

  const byWard = useMemo(() => priorityByWard(), []);
  const byWardAll = useMemo(() => workItemsByWard(), []);
  const totalCount = priority.length;
  const totalCost = priority.reduce((s, p) => s + p.cost, 0);

  const wardRows = useMemo(
    () =>
      wards
        .map((w, i) => ({ w, i, ...byWard.get(w.ward)! }))
        .filter((r) => r.count > 0)
        .sort((a, b) => b.cost - a.cost || b.count - a.count),
    [byWard],
  );

  const selectedMeta = selectedWard !== null ? wards.find((w) => w.ward === selectedWard) : undefined;
  const wardItems = selectedWard !== null ? (byWardAll.get(selectedWard) ?? []) : [];
  const filteredItems = wardItems
    .filter((i) => (catFilter === "all" || i.cat === catFilter) && condFilter.has(i.cond))
    .sort((a, b) => b.cost - a.cost);

  function toggleCond(k: ConditionKey) {
    setCondFilter((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next.size ? next : prev;
    });
  }

  const catColor: Record<PriorityCat, string> = {
    road: COST_COLORS.road,
    ugd: COST_COLORS.ugd,
    attach: COST_COLORS.attach,
    swg: COST_COLORS.swg,
    jal: COST_COLORS.jal,
    elec: "var(--coral)",
  };

  return (
    <section className="relative mx-auto max-w-6xl px-6 pb-24">
      <SectionHead
        eyebrow="05 — What needs attention first"
        title="Top priority works"
        sub="Segments flagged Required (or missing entirely) across every category — the work that can't wait for the routine maintenance cycle."
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="shadow-card mt-8 overflow-hidden rounded-3xl border bg-card"
      >
        <button
          onClick={() => {
            setOpen(!open);
            if (open) setSelectedWard(null);
          }}
          className="flex w-full cursor-pointer items-center justify-between gap-4 p-6 text-left"
        >
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_oklab,var(--coral)_16%,transparent)] text-[var(--coral)]">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <div className="font-display text-lg font-bold sm:text-xl">
                {totalCount.toLocaleString("en-IN")} priority items across {wardRows.length} wards
              </div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Tap to see the ward-by-ward breakdown
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-xl font-bold text-[var(--coral)] sm:text-2xl">
              <CountUp to={totalCost} format={inr} />
            </span>
            <motion.span animate={{ rotate: open ? 180 : 0 }} className="grid h-8 w-8 place-items-center">
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t"
            >
              <div className="p-6">
                {selectedWard === null ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {wardRows.map(({ w, i, count, cost }) => (
                      <button
                        key={w.ward}
                        onClick={() => setSelectedWard(w.ward)}
                        className="cursor-pointer rounded-2xl border bg-surface p-4 text-left transition hover:-translate-y-0.5"
                        style={{ borderTop: `3px solid ${wardAccent(i)}` }}
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-display text-sm font-bold" style={{ color: wardAccent(i) }}>
                            {String(w.ward).padStart(2, "0")}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">{w.name}</span>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between gap-2">
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {count} item{count === 1 ? "" : "s"}
                          </span>
                          <span className="font-display text-sm font-bold">{inr(cost)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => setSelectedWard(null)}
                      className="mb-4 inline-flex cursor-pointer items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-accent"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> All wards
                    </button>
                    <div className="mb-4 font-display text-base font-bold">
                      Ward {String(selectedWard).padStart(2, "0")} — {selectedMeta?.name}
                      <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                        {wardItems.length} tracked items
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setCatFilter("all")}
                        className="cursor-pointer rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition"
                        style={
                          catFilter === "all"
                            ? { background: "var(--foreground)", color: "var(--background)" }
                            : { background: "var(--surface)", color: "var(--muted-foreground)" }
                        }
                      >
                        All categories
                      </button>
                      {PRIORITY_CATS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setCatFilter(c)}
                          className="cursor-pointer rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition"
                          style={
                            catFilter === c
                              ? { background: catColor[c], color: "var(--background)" }
                              : {
                                  background: `color-mix(in oklab, ${catColor[c]} 14%, transparent)`,
                                  color: catColor[c],
                                }
                          }
                        >
                          {PRIORITY_LABELS[c]}
                        </button>
                      ))}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {CONDITION_KEYS.map((k) => {
                        const active = condFilter.has(k);
                        return (
                          <button
                            key={k}
                            onClick={() => toggleCond(k)}
                            className="cursor-pointer rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition"
                            style={{
                              borderColor: CONDITION_COLORS[k],
                              background: active
                                ? `color-mix(in oklab, ${CONDITION_COLORS[k]} 20%, transparent)`
                                : "transparent",
                              color: active ? CONDITION_COLORS[k] : "var(--muted-foreground)",
                              opacity: active ? 1 : 0.6,
                            }}
                          >
                            {k}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 space-y-2">
                      {filteredItems.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedRoad(findRoad(item.ward, item.no) ?? null)}
                          className="grid w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border bg-surface p-3 text-left transition hover:-translate-y-0.5 hover:border-accent"
                        >
                          <span
                            className="rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider"
                            style={{
                              background: `color-mix(in oklab, ${CONDITION_COLORS[item.cond]} 16%, transparent)`,
                              color: CONDITION_COLORS[item.cond],
                            }}
                          >
                            {item.cond}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">
                              <span style={{ color: catColor[item.cat] }}>{PRIORITY_LABELS[item.cat]}</span>
                              {" — "}
                              {item.main}
                              {item.cross && <span className="text-muted-foreground"> · {item.cross}</span>}
                            </div>
                            <div className="truncate font-mono text-[10.5px] text-muted-foreground">
                              {item.area} — {item.action}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-sm font-bold">
                              {item.cost > 0 ? inr(item.cost) : "TBD"}
                            </div>
                            {item.map && (
                              <span className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                                Details <ExternalLink className="h-3 w-3" />
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                      {filteredItems.length === 0 && (
                        <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
                          No items match this filter for this ward.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <RoadDetailDialog road={selectedRoad} onClose={() => setSelectedRoad(null)} />
    </section>
  );
}
