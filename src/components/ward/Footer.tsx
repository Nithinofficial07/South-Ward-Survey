import { motion } from "motion/react";
import { inr, km, totals, wards } from "@/lib/ward-data";

export function TopWardsMarquee() {
  const top = wards.slice().sort((a, b) => b.total - a.total);
  const items = [...top, ...top];

  return (
    <section className="bg-hero relative overflow-hidden py-14">
      <div className="grid-bg absolute inset-0 opacity-50" />
      <div className="relative mb-6 px-6 text-center font-mono text-[11px] uppercase tracking-[0.24em] text-[oklch(0.9_0.04_170)]">
        Ranked by estimated investment
      </div>
      <div className="relative flex w-max animate-marquee gap-4">
        {items.map((w, i) => (
          <div
            key={i}
            className="w-56 shrink-0 rounded-2xl border border-[oklch(1_0_0/0.18)] bg-[oklch(1_0_0/0.1)] p-5 backdrop-blur"
          >
            <div className="font-mono text-[10px] uppercase tracking-widest text-[oklch(0.88_0.04_170)]">
              Ward {String(w.ward).padStart(2, "0")} · {w.name}
            </div>
            <div className="mt-1 font-display text-xl font-bold text-[oklch(1_0_0)]">
              {inr(w.total)}
            </div>
            <div className="mt-1 font-mono text-[10px] text-[oklch(0.86_0.04_170)]">
              {(w.areaSqm / 10000).toFixed(2)} ha · {km(w.length)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-card py-14">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-6xl px-6"
      >
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h3 className="text-xl font-bold">Davanagere South — Ward Infrastructure Register</h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Compiled from field surveys of {totals.segments.toLocaleString("en-IN")} road segments
              across {totals.wards} wards. Road, drain and paver rates follow the PWD Common Schedule
              of Rates 2023-24 (incl. 18% GST). Gutter, Jalasiri and signage rates are uniform
              placeholder assumptions applied to every ward for comparability. Entries marked
              "Unknown" reflect inconclusive field records, not data errors.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { l: "Wards", v: totals.wards },
              { l: "TOTAL AREA", v: km(totals.length) },
              { l: "Estimate", v: inr(totals.cost) },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-surface p-4">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.l}
                </div>
                <div className="mt-1 font-display text-lg font-semibold">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 border-t pt-6 font-mono text-[10.5px] uppercase tracking-widest text-muted-foreground">
          Official record · Municipal infrastructure survey
        </div>
      </motion.div>
    </footer>
  );
}
