import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, MapPinned, Ruler, Signpost } from "lucide-react";
import { CountUp } from "./CountUp";
import {
  CONDITION_COLORS,
  COST_COLORS,
  COST_LABELS,
  inr,
  km,
  wardAccent,
  wards,
  type CostKey,
  type Ward,
} from "@/lib/ward-data";

export function WardGrid() {
  const [open, setOpen] = useState<number | null>(null);
  const maxCost = Math.max(...wards.map((w) => w.total));

  return (
    <section id="wards" className="relative bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55 }}
            className="max-w-2xl"
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
              02 — Ward by ward
            </div>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Ward Development Matrix</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Ward-wise civic works overview with condition status, investment estimates, and
              street-level breakdown across the constituency.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="relative shrink-0"
          >
            <div className="absolute inset-0 -z-10 rounded-full bg-[var(--teal)] opacity-20 blur-3xl" />
            <img
              src="/assets/ward-lead.png"
              alt=""
              className="h-40 w-auto object-contain drop-shadow-xl sm:h-48"
            />
          </motion.div>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {wards.map((w, i) => (
            <WardCard
              key={w.ward}
              w={w}
              i={i}
              share={w.total / maxCost}
              open={open === w.ward}
              onToggle={() => setOpen(open === w.ward ? null : w.ward)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function WardCard({
  w,
  i,
  share,
  open,
  onToggle,
}: {
  w: Ward;
  i: number;
  share: number;
  open: boolean;
  onToggle: () => void;
}) {
  const accent = wardAccent(i);
  const condTotal = w.segments || 1;
  const conds = (["Good", "Maintenance", "Required", "Unknown"] as const).map((k) => ({
    k,
    v: w.cond[k],
  }));
  const costs = (Object.keys(COST_LABELS) as CostKey[])
    .map((k) => ({ k, v: w.cost[k] }))
    .filter((c) => c.v > 0)
    .sort((a, b) => b.v - a.v);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
      className={`card-lift shadow-card group relative overflow-hidden rounded-3xl border bg-card ${open ? "sm:col-span-2 lg:col-span-3" : ""}`}
      style={{ borderTop: `4px solid ${accent}` }}
    >
      <button onClick={onToggle} className="w-full cursor-pointer p-6 text-left">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Ward No.
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold" style={{ color: accent }}>
                {String(w.ward).padStart(2, "0")}
              </span>
              <span className="truncate text-sm text-muted-foreground">{w.name}</span>
            </div>
          </div>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
            style={{ background: `color-mix(in oklab, ${accent} 18%, transparent)`, color: accent }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Signpost className="h-3.5 w-3.5" /> {w.segments} segments
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Ruler className="h-3.5 w-3.5" /> {km(w.length)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPinned className="h-3.5 w-3.5" /> {(w.areaSqm / 10000).toFixed(2)} ha
          </span>
        </div>

        <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-muted">
          {conds.map((c) => (
            <motion.div
              key={c.k}
              initial={{ width: 0 }}
              whileInView={{ width: `${(c.v / condTotal) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={{ background: CONDITION_COLORS[c.k] }}
            />
          ))}
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Estimated works
            </div>
            <div className="font-display text-2xl font-bold">
              <CountUp to={w.total} format={inr} />
            </div>
          </div>
          <div className="h-10 w-24 rounded-lg bg-muted p-1">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${Math.max(share * 100, 6)}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded"
              style={{ background: accent }}
            />
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t"
          >
            <div className="grid gap-8 p-6 lg:grid-cols-3">
              <div>
                <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Cost breakdown
                </h4>
                <div className="mt-4 space-y-3">
                  {costs.map((c) => (
                    <div key={c.k}>
                      <div className="flex justify-between text-xs">
                        <span>{COST_LABELS[c.k]}</span>
                        <span className="font-mono font-semibold">{inr(c.v)}</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(c.v / (costs[0]?.v || 1)) * 100}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{ background: COST_COLORS[c.k] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Condition of road segments
                </h4>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {conds.map((c) => (
                    <div
                      key={c.k}
                      className="rounded-2xl p-4"
                      style={{ background: `color-mix(in oklab, ${CONDITION_COLORS[c.k]} 12%, transparent)` }}
                    >
                      <div className="text-2xl font-bold" style={{ color: CONDITION_COLORS[c.k] }}>
                        {c.v}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {c.k}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {w.materials.slice(0, 5).map((m) => (
                    <span
                      key={m.name}
                      className="rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider"
                    >
                      {m.name} · {m.count}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Top localities by spend
                </h4>
                <ul className="mt-4 space-y-2">
                  {w.areas.slice(0, 6).map((a) => (
                    <li
                      key={a.name}
                      className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2"
                    >
                      <span className="min-w-0 truncate text-xs">{a.name}</span>
                      <span className="shrink-0 font-mono text-[11px] font-semibold" style={{ color: accent }}>
                        {inr(a.cost)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
