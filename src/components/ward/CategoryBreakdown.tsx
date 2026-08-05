import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Lightbulb } from "lucide-react";
import { CountUp } from "./CountUp";
import {
  CARD_KEYS,
  COST_COLORS,
  COST_LABELS,
  CONDITION_COLORS,
  inr,
  totals,
  wardAccent,
  wards,
  type CostKey,
} from "@/lib/ward-data";

type OpenKey = CostKey | "elec" | null;

export function CategoryBreakdown() {
  const [open, setOpen] = useState<OpenKey>(null);
  const cards = CARD_KEYS.map((k) => ({
    key: k,
    label: COST_LABELS[k],
    value: totals.byCategory.find((c) => c.key === k)?.value ?? 0,
  })).sort((a, b) => b.value - a.value);
  const max = Math.max(...cards.map((c) => c.value));

  const elecSegments = wards.reduce((s, w) => s + w.elecSegments, 0);
  const elecCond = wards.reduce(
    (acc, w) => {
      acc.Good += w.elecCond.Good;
      acc.Maintenance += w.elecCond.Maintenance;
      acc.Required += w.elecCond.Required;
      acc.Unknown += w.elecCond.Unknown;
      return acc;
    },
    { Good: 0, Maintenance: 0, Required: 0, Unknown: 0 },
  );

  return (
    <section id="investment" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHead
        eyebrow="01 — Where the money goes"
        title="Summary of Estimation"
      />

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          {cards.map((c, i) => (
            <CategoryRow
              key={c.key}
              label={c.label}
              value={c.value}
              share={totals.cost ? c.value / totals.cost : 0}
              barShare={max ? c.value / max : 0}
              color={COST_COLORS[c.key]}
              delay={i * 0.07}
              open={open === c.key}
              onToggle={() => setOpen(open === c.key ? null : c.key)}
            >
              <WardAmountGrid accessor={(w) => w.cost[c.key]} color={COST_COLORS[c.key]} />
            </CategoryRow>
          ))}

          <CategoryRow
            label="Electrical"
            value={null}
            note={`${elecSegments.toLocaleString("en-IN")} segments surveyed · rate not yet defined`}
            color="var(--coral)"
            delay={cards.length * 0.07}
            open={open === "elec"}
            onToggle={() => setOpen(open === "elec" ? null : "elec")}
            icon={<Lightbulb className="h-3.5 w-3.5" />}
          >
            <div className="mb-4 flex flex-wrap gap-2">
              {(["Good", "Maintenance", "Required", "Unknown"] as const).map((k) => (
                <span
                  key={k}
                  className="rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider"
                  style={{
                    background: `color-mix(in oklab, ${CONDITION_COLORS[k]} 15%, transparent)`,
                    color: CONDITION_COLORS[k],
                  }}
                >
                  {k} · {elecCond[k]}
                </span>
              ))}
            </div>
            <WardElecGrid />
          </CategoryRow>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="shadow-card relative overflow-hidden rounded-3xl border bg-card p-8"
        >
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[var(--teal)] opacity-15 blur-2xl" />
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Total estimated outlay
          </div>
          <div className="mt-3 text-5xl font-bold text-gradient">
            <CountUp to={totals.cost} format={inr} />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Across {totals.segments.toLocaleString("en-IN")} surveyed segments covering{" "}
            {(totals.areaSqm / 10000).toFixed(1)} hectares of road surface. Rates follow the PWD
            Common Schedule of Rates 2023-24 including 18% GST; gutter, water-line and signage rates
            are uniform placeholder assumptions pending official confirmation. Electrical works are
            tracked but not yet costed.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {[
              { l: "Avg per ward", v: inr(totals.cost / totals.wards) },
              { l: "Avg per segment", v: inr(totals.cost / totals.segments) },
              { l: "Surveyed length", v: `${(totals.length / 1000).toFixed(1)} km` },
              { l: "Road surface", v: `${(totals.areaSqm / 1000).toFixed(0)}k m²` },
            ].map((x) => (
              <div key={x.l} className="rounded-2xl bg-surface p-4">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {x.l}
                </div>
                <div className="mt-1 font-display text-lg font-semibold">{x.v}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CategoryRow({
  label,
  value,
  share,
  barShare,
  note,
  color,
  delay,
  open,
  onToggle,
  icon,
  children,
}: {
  label: string;
  value: number | null;
  share?: number;
  barShare?: number;
  note?: string;
  color: string;
  delay: number;
  open: boolean;
  onToggle: () => void;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay }}
      className="rounded-2xl"
    >
      <button onClick={onToggle} className="w-full cursor-pointer text-left">
        <div className="flex items-baseline justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 font-display text-sm font-semibold sm:text-base">
            {icon}
            {label}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="font-mono text-sm font-semibold" style={{ color }}>
              {value === null ? "₹0 · TBD" : <CountUp to={value} format={inr} />}
            </span>
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full"
              style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </motion.span>
          </span>
        </div>
        {value !== null && barShare !== undefined && (
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${barShare * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, delay: 0.15 + delay, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${color}, color-mix(in oklab, ${color} 55%, white))` }}
            />
          </div>
        )}
        <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {note ?? (share !== undefined ? `${(share * 100).toFixed(1)}% of total estimate` : null)}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-2xl border bg-surface p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function WardAmountGrid({ accessor, color }: { accessor: (w: (typeof wards)[number]) => number; color: string }) {
  const items = wards
    .map((w, i) => ({ w, i, value: accessor(w) }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
      {items.map(({ w, i, value }) => (
        <div
          key={w.ward}
          className="rounded-xl border bg-card px-3 py-2.5"
          style={{ borderLeft: `3px solid ${wardAccent(i)}` }}
        >
          <div className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {String(w.ward).padStart(2, "0")} · {w.name}
          </div>
          <div className="mt-0.5 font-display text-sm font-bold" style={{ color }}>
            {inr(value)}
          </div>
        </div>
      ))}
    </div>
  );
}

function WardElecGrid() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
      {wards
        .slice()
        .sort((a, b) => b.elecCond.Required - a.elecCond.Required)
        .map((w, i) => (
          <div
            key={w.ward}
            className="rounded-xl border bg-card px-3 py-2.5"
            style={{ borderLeft: `3px solid ${wardAccent(i)}` }}
          >
            <div className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {String(w.ward).padStart(2, "0")} · {w.name}
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {(["Good", "Maintenance", "Required", "Unknown"] as const)
                .filter((k) => w.elecCond[k] > 0)
                .map((k) => (
                  <span
                    key={k}
                    className="rounded-full px-1.5 py-0.5 font-mono text-[9px]"
                    style={{
                      background: `color-mix(in oklab, ${CONDITION_COLORS[k]} 15%, transparent)`,
                      color: CONDITION_COLORS[k],
                    }}
                  >
                    {k[0]}·{w.elecCond[k]}
                  </span>
                ))}
            </div>
          </div>
        ))}
    </div>
  );
}

export function SectionHead({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55 }}
      className="max-w-2xl"
    >
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">{eyebrow}</div>
      <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-base leading-relaxed text-muted-foreground">{sub}</p>}
    </motion.div>
  );
}
