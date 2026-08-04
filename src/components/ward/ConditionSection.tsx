import { motion } from "motion/react";
import { SectionHead } from "./CategoryBreakdown";
import { CONDITION_COLORS, totals } from "@/lib/ward-data";

const NOTES: Record<string, string> = {
  Good: "Serviceable — no immediate works costed.",
  Maintenance: "Repair or resurfacing needed within the cycle.",
  Required: "Full construction or replacement recorded as required.",
  Unknown: "Field entry was inconclusive; needs re-survey.",
};

export function ConditionSection() {
  const entries = Object.entries(totals.condition) as [keyof typeof totals.condition, number][];
  const sum = entries.reduce((s, [, v]) => s + v, 0);

  return (
    <section id="condition" className="relative overflow-hidden py-24">
      <div className="animate-float-slow absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--coral)] opacity-10 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHead
          eyebrow="03 — Ground condition"
          title="What the surveyors actually found"
          sub={`Every one of the ${sum.toLocaleString("en-IN")} segments was graded on the spot.`}
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {entries.map(([k, v], i) => (
            <motion.div
              key={k}
              initial={{ opacity: 0, y: 30, rotate: -1 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              whileHover={{ y: -8, rotate: i % 2 ? 1 : -1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="shadow-card relative overflow-hidden rounded-3xl border bg-card p-6"
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
            </motion.div>
          ))}
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
      </div>
    </section>
  );
}
