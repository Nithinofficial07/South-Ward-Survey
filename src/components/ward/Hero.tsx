import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowDown, MapPinned } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { CountUp } from "./CountUp";
import { inr, km, totals } from "@/lib/ward-data";

const MotionLink = motion.create(Link);

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="bg-hero relative overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-60" />
      <div className="animate-float-slow absolute -top-40 -left-32 h-[26rem] w-[26rem] rounded-full bg-[var(--lime)] opacity-25 blur-3xl" />
      <div className="animate-float-slow absolute -right-24 top-24 h-[22rem] w-[22rem] rounded-full bg-[var(--amber)] opacity-25 blur-3xl [animation-delay:2s]" />
      <div className="animate-spin-slow absolute -bottom-52 left-1/3 h-[30rem] w-[30rem] rounded-full bg-[var(--violet)] opacity-20 blur-3xl" />

      <motion.div
        style={{ y, opacity: fade }}
        className="relative mx-auto max-w-6xl px-6 pb-28 pt-24 sm:pt-32"
      >
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
          Ward Infrastructure
          <span className="block bg-gradient-to-r from-[var(--lime)] via-[var(--amber)] to-[var(--coral)] bg-clip-text text-transparent">
            Register & Investment Map
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

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24 }}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { label: "Wards Surveyed", value: totals.wards, fmt: (n: number) => Math.round(n).toString() },
            { label: "Road Segments", value: totals.segments },
            { label: "Road Network", value: totals.length, fmt: km },
            { label: "Estimated Works", value: totals.cost, fmt: inr },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              whileHover={{ y: -6 }}
              className="rounded-2xl border border-[oklch(1_0_0/0.18)] bg-[oklch(1_0_0/0.1)] p-5 backdrop-blur-md"
              style={{ borderTopColor: ["var(--lime)", "var(--amber)", "var(--coral)", "var(--sky)"][i], borderTopWidth: 3 }}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[oklch(0.88_0.04_170)]">
                {s.label}
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
    </section>
  );
}
