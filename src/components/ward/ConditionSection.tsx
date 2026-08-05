import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SectionHead } from "./CategoryBreakdown";
import {
  COST_COLORS,
  CONDITION_COLORS,
  PRIORITY_CATS,
  PRIORITY_LABELS,
  inr,
  totals,
  wards,
  workItems,
} from "@/lib/ward-data";

const CAT_COLORS: Record<(typeof PRIORITY_CATS)[number], string> = {
  road: COST_COLORS.road,
  ugd: COST_COLORS.ugd,
  attach: COST_COLORS.attach,
  swg: COST_COLORS.swg,
  jal: COST_COLORS.jal,
  elec: "var(--coral)",
};

const NOTES: Record<string, string> = {
  Good: "Serviceable — no immediate works costed.",
  Maintenance: "Repair or resurfacing needed within the cycle.",
  Required: "Full construction or replacement recorded as required.",
  Unknown: "Field entry was inconclusive; needs re-survey.",
};

export function ConditionSection() {
  const entries = Object.entries(totals.condition) as [keyof typeof totals.condition, number][];
  const sum = entries.reduce((s, [, v]) => s + v, 0);
  const [selected, setSelected] = useState<keyof typeof totals.condition>("Required");

  const wardData = useMemo(
    () =>
      wards
        .map((w) => ({
          ward: `Ward ${String(w.ward).padStart(2, "0")}`,
          value: w.cond[selected],
        }))
        .sort((a, b) => b.value - a.value),
    [selected],
  );

  const categoryData = useMemo(
    () =>
      PRIORITY_CATS.map((cat) => {
        const matches = workItems.filter((i) => i.cond === selected && i.cat === cat);
        return {
          cat,
          count: matches.length,
          cost: matches.reduce((s, i) => s + i.cost, 0),
        };
      }),
    [selected],
  );

  return (
    <section id="condition" className="relative overflow-hidden py-24">
      <div className="animate-float-slow absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--coral)] opacity-10 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHead
          eyebrow="03 — Ground condition"
          title="Summary of conditions"
          sub={`Every one of the ${sum.toLocaleString("en-IN")} segments was graded on the spot.`}
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {entries.map(([k, v], i) => {
            const active = selected === k;
            return (
              <motion.button
                key={k}
                type="button"
                onClick={() => setSelected(k)}
                initial={{ opacity: 0, y: 30, rotate: -1 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                whileHover={{ y: -8, rotate: i % 2 ? 1 : -1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`shadow-card relative w-full overflow-hidden rounded-3xl border bg-card p-6 text-left transition ${active ? "ring-2 ring-offset-2 ring-offset-background" : ""}`}
                style={{ borderColor: active ? CONDITION_COLORS[k] : undefined }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{ background: CONDITION_COLORS[k] }}
                />
                <div
                  className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-15 blur-xl"
                  style={{ background: CONDITION_COLORS[k] }}
                />
                <div className="text-5xl font-bold" style={{ color: CONDITION_COLORS[k] }}>
                  {v}
                </div>
                <div className="mt-1 font-display text-lg font-semibold">{k}</div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                  {((v / sum) * 100).toFixed(1)}% of all segments
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{NOTES[k]}</p>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-10 flex h-6 overflow-hidden rounded-full">
          {entries.map(([k, v]) => (
            <motion.div
              key={k}
              initial={{ width: 0 }}
              whileInView={{ width: `${(v / sum) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ background: CONDITION_COLORS[k] }}
            />
          ))}
        </div>

        <div className="mt-12 rounded-3xl border bg-card p-5 shadow-card">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Ward-wise breakdown
              </div>
              <h3 className="mt-1 font-display text-2xl font-bold">{selected} condition</h3>
            </div>
            <div
              className="rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em]"
              style={{
                background: `color-mix(in oklab, ${CONDITION_COLORS[selected]} 16%, transparent)`,
                color: CONDITION_COLORS[selected],
              }}
            >
              {wardData.reduce((total, item) => total + item.value, 0)} segments
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardData} margin={{ top: 12, right: 12, left: 0, bottom: 28 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="ward" angle={-20} textAnchor="end" interval={0} height={52} tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => [`${value} segments`, selected]}
                  labelStyle={{ color: "var(--foreground)" }}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="value" name={selected} fill={CONDITION_COLORS[selected]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border bg-card p-5 shadow-card">
          <div className="mb-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Category-wise breakdown
            </div>
            <h3 className="mt-1 font-display text-2xl font-bold">{selected} by work category</h3>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {categoryData.map((c, i) => (
                <motion.div
                  key={c.cat}
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden rounded-2xl border bg-surface p-5"
                  style={{ borderTop: `3px solid ${CAT_COLORS[c.cat]}` }}
                >
                  <div
                    className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-15 blur-xl"
                    style={{ background: CAT_COLORS[c.cat] }}
                  />
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {PRIORITY_LABELS[c.cat]}
                  </div>
                  <div className="mt-2 text-3xl font-bold" style={{ color: CAT_COLORS[c.cat] }}>
                    {c.count}
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                    segment{c.count === 1 ? "" : "s"} · {c.cat === "elec" ? "rate TBD" : inr(c.cost)}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
