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
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="mt-6 max-w-4xl text-4xl font-bold leading-[1.05] text-[oklch(1_0_0)] sm:text-6xl lg:text-7xl"
            >
              Ward
              <span className="block bg-gradient-to-r from-[var(--lime)] via-[var(--amber)] to-[var(--coral)] bg-clip-text text-transparent">
                Development Matrix
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16 }}
              className="mt-6 max-w-2xl text-base leading-relaxed text-[oklch(0.92_0.03_180)] sm:text-lg"
            >
              Ward-wise civic works overview with condition status, investment estimates, and street-level breakdown across the constituency.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.24 }}
              className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {[
                { label: "Wards Surveyed", value: totals.wards, fmt: (n: number) => Math.round(n).toString() },
                { label: "Total Number of Roads", value: totals.segments },
                { label: "Total Area", value: totals.length, fmt: km },
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
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center"
          >
            <div className="absolute -inset-8 rounded-[2.5rem] bg-[oklch(1_0_0/0.08)] blur-3xl" />
            <div className="relative w-full max-w-[420px] overflow-hidden rounded-[2rem] border border-[oklch(1_0_0/0.18)] bg-[oklch(1_0_0/0.08)] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm">
              <div className="overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent_35%)]">
                <img
                  src="/mla-portrait.png"
                  alt="Sri Samarth Shamnur Mallikarjun"
                  className="h-[520px] w-full object-cover object-[center_18%]"
                />
              </div>
              <div className="mt-4 text-center">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[oklch(0.85_0.02_170)]">
                  MLA of Davanagere South Constituency
                </div>
                <div className="mt-2 text-xl font-bold text-white sm:text-2xl">
                  Sri Samarth Shamnur Mallikarjun
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
