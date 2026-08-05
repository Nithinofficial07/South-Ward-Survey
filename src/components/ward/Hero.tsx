import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { ArrowDown, MapPinned } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { CountUp } from "./CountUp";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { COST_COLORS, COST_LABELS, inr, km, totals, wards, type CostKey } from "@/lib/ward-data";

function ha(n: number) {
  return `${(n / 10000).toFixed(1)} ha`;
}

const BREAKDOWN_ORDER: CostKey[] = ["road", "ugd", "swg", "attach", "jal"];

const MotionLink = motion.create(Link);

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const elecSegments = wards.reduce((s, w) => s + w.elecSegments, 0);

  return (
    <section ref={ref} className="bg-hero relative overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-60" />
      <div className="animate-float-slow absolute -top-40 -left-32 h-[26rem] w-[26rem] rounded-full bg-[var(--lime)] opacity-25 blur-3xl" />
      <div className="animate-float-slow absolute -right-24 top-24 h-[22rem] w-[22rem] rounded-full bg-[var(--amber)] opacity-25 blur-3xl [animation-delay:2s]" />
      <div className="animate-spin-slow absolute -bottom-52 left-1/3 h-[30rem] w-[30rem] rounded-full bg-[var(--violet)] opacity-20 blur-3xl" />
      <div className="animate-pulse-glow absolute -bottom-16 right-1/4 h-64 w-64 rounded-full bg-[var(--coral)] blur-3xl" />

      <motion.div
        style={{ y, opacity: fade }}
        className="relative mx-auto max-w-6xl px-6 pb-28 pt-24 sm:pt-32"
      >
        <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-[oklch(1_0_0/0.25)] bg-[oklch(1_0_0/0.12)] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[oklch(0.96_0.02_120)] backdrop-blur"
            >
              <MapPinned className="h-3.5 w-3.5" />
              Davanagere South Constituency
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="mt-6 max-w-4xl text-4xl font-bold leading-[1.05] text-[oklch(1_0_0)] sm:text-6xl lg:text-7xl"
            >
              Ward Development
              <span className="animate-shimmer-text block bg-gradient-to-r from-[var(--lime)] via-[var(--amber)] to-[var(--coral)] bg-clip-text text-transparent">
                Matrix
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16 }}
              className="mt-6 max-w-2xl text-base leading-relaxed text-[oklch(0.92_0.03_180)] sm:text-lg"
            >
              A street-by-street field survey of {totals.segments.toLocaleString("en-IN")} road segments
              across {totals.wards} wards — roads, drains, footpaths, gutters, water lines and signage,
              costed against the PWD Schedule of Rates 2023-24.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative shrink-0 self-center text-center lg:self-end"
          >
            <div className="animate-pulse-glow absolute inset-0 -z-10 rounded-full bg-[var(--lime)]" />
            <motion.img
              src="/assets/ward-lead.png"
              alt="Sri Samarth Shamanur Mallikarjun"
              animate={{ y: [0, -14, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="h-72 w-auto object-contain drop-shadow-2xl sm:h-[26rem]"
            />

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-2"
            >
              <div className="font-display text-lg font-bold text-[oklch(1_0_0)] sm:text-xl">
                Sri Samarth Shamanur Mallikarjun
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[oklch(0.88_0.04_170)] sm:text-[11px]">
                MLA, Davanagere South Constituency
              </div>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto mt-2 h-[2px] w-16 origin-center rounded-full bg-gradient-to-r from-[var(--lime)] via-[var(--amber)] to-[var(--coral)]"
              />
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24 }}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { label: "Total Roads", value: totals.segments, onClick: undefined },
            { label: "Total Area", value: totals.areaSqm, fmt: ha, onClick: undefined },
            { label: "Total Area", value: totals.length, fmt: km, onClick: undefined },
            { label: "Total Investment", value: totals.cost, fmt: inr, onClick: () => setShowBreakdown(true) },
          ].map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6 }}
              onClick={s.onClick}
              className={`rounded-2xl border border-[oklch(1_0_0/0.18)] bg-[oklch(1_0_0/0.1)] p-5 backdrop-blur-md ${s.onClick ? "cursor-pointer transition hover:bg-[oklch(1_0_0/0.16)]" : ""}`}
              style={{ borderTopColor: ["var(--lime)", "var(--amber)", "var(--sky)", "var(--coral)"][i], borderTopWidth: 3 }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[oklch(0.88_0.04_170)]">
                  {s.label}
                </div>
                {s.onClick && (
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[oklch(0.88_0.04_170)] opacity-70">
                    View breakdown →
                  </span>
                )}
              </div>
              <div className="mt-2 text-3xl font-bold text-[oklch(1_0_0)]">
                <CountUp to={s.value} format={s.fmt} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <MotionLink
          to="/wards"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-14 inline-flex items-center gap-2 text-sm font-medium text-[oklch(0.92_0.03_180)]"
        >
          <motion.span
            animate={{ y: [0, 7, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="grid h-9 w-9 place-items-center rounded-full border border-[oklch(1_0_0/0.3)]"
          >
            <ArrowDown className="h-4 w-4" />
          </motion.span>
          Explore every ward
        </MotionLink>
      </motion.div>

      <Dialog open={showBreakdown} onOpenChange={setShowBreakdown}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Total Investment Breakdown</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {BREAKDOWN_ORDER.map((k) => {
              const value = wards.reduce((s, w) => s + w.cost[k], 0);
              return (
                <div key={k} className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-sm font-medium">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COST_COLORS[k] }} />
                    {COST_LABELS[k]}
                  </span>
                  <span className="font-mono text-sm font-bold" style={{ color: COST_COLORS[k] }}>
                    {inr(value)}
                  </span>
                </div>
              );
            })}
            <div className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3">
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: "var(--coral)" }} />
                Electrical
              </span>
              <span className="font-mono text-sm font-bold text-muted-foreground">
                TBD · {elecSegments.toLocaleString("en-IN")} segments
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between border-t pt-4">
            <span className="font-display text-base font-bold">Total</span>
            <span className="font-display text-xl font-bold text-gradient">{inr(totals.cost)}</span>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
