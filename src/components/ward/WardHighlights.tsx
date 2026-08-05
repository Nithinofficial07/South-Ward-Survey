import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Signpost } from "lucide-react";
import { SectionHead } from "./CategoryBreakdown";
import { CountUp } from "./CountUp";
import { CONDITION_COLORS, inr, km, wardAccent, wards } from "@/lib/ward-data";

export function WardHighlights() {
  const top = wards
    .slice()
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute -left-32 top-1/2 h-[24rem] w-[24rem] -translate-y-1/2 rounded-full bg-[var(--sky)] opacity-10 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            eyebrow="Wards Highlights"
            title="Where the biggest works are happening"
            sub="The four highest-investment wards in the register, at a glance."
          />
          <Link
            to="/wards"
            className="group mb-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition hover:border-accent hover:text-accent"
          >
            View all wards
            <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {top.map((w, i) => {
            const accent = wardAccent(wards.indexOf(w));
            const condTotal = w.segments || 1;
            const conds = (["Good", "Maintenance", "Required", "Unknown"] as const).map((k) => ({
              k,
              v: w.cond[k],
            }));
            return (
              <motion.div
                key={w.ward}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card-lift shadow-card relative overflow-hidden rounded-3xl border bg-card p-6"
                style={{ borderTop: `4px solid ${accent}` }}
              >
                <div
                  className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-15 blur-2xl"
                  style={{ background: accent }}
                />
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Ward No.
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-4xl font-bold" style={{ color: accent }}>
                    {String(w.ward).padStart(2, "0")}
                  </span>
                </div>
                <div className="truncate text-sm text-muted-foreground">{w.name}</div>

                <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-muted">
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

                <div className="mt-4 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                  <Signpost className="h-3.5 w-3.5" /> {w.segments} segments · {km(w.length)}
                </div>

                <div className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Estimated works
                </div>
                <div className="font-display text-xl font-bold">
                  <CountUp to={w.total} format={inr} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
