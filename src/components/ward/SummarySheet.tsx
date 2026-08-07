import { useState } from "react";
import { motion } from "motion/react";
import { SectionHead } from "./CategoryBreakdown";
import {
  CARD_KEYS,
  COST_LABELS,
  acres,
  inr,
  km,
  wardAccent,
  wardWorksCount,
  wards,
  type CostKey,
} from "@/lib/ward-data";

type SortKey = "ward" | "total" | "segments" | "areaSqm" | "length";

export function SummarySheet() {
  const [sortKey, setSortKey] = useState<SortKey>("ward");
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  const rows = wards
    .map((w, i) => ({ w, accent: wardAccent(i), works: wardWorksCount(w.ward) }))
    .sort((a, b) => sortDir * (a.w[sortKey] - b.w[sortKey]));

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(1);
    }
  }

  const th = (key: SortKey, label: string, align: "left" | "right" = "right") => (
    <th
      onClick={() => toggleSort(key)}
      className={`cursor-pointer select-none whitespace-nowrap px-3 py-2.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-accent ${align === "left" ? "text-left" : "text-right"}`}
    >
      {label}
      {sortKey === key && (sortDir === 1 ? " ▲" : " ▼")}
    </th>
  );

  const grandTotal = wards.reduce((s, w) => s + w.total, 0);

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24">
      <SectionHead
        eyebrow="06 — Full register"
        title="Ward Summary Sheet"
        sub="Every ward, one row each — roads, area, length, category costs and totals. Click a column header to sort."
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="shadow-card mt-10 overflow-x-auto rounded-3xl border bg-card"
      >
        <table className="w-full min-w-[1100px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-surface">
              <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                #
              </th>
              {th("ward", "Ward", "left")}
              <th className="px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Name
              </th>
              {th("segments", "Roads")}
              {th("length", "Length")}
              {th("areaSqm", "Area")}
              {CARD_KEYS.map((k) => (
                <th
                  key={k}
                  className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                >
                  {COST_LABELS[k as CostKey]}
                </th>
              ))}
              <th className="px-3 py-2.5 text-right font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Works
              </th>
              {th("total", "Total")}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ w, accent, works }, i) => (
              <tr key={w.ward} className="border-b last:border-0 hover:bg-surface" style={{ borderLeft: `3px solid ${accent}` }}>
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{i + 1}</td>
                <td className="px-3 py-2.5 font-display text-sm font-bold" style={{ color: accent }}>
                  {String(w.ward).padStart(2, "0")}
                </td>
                <td className="px-3 py-2.5 text-sm">{w.name}</td>
                <td className="px-3 py-2.5 text-right font-mono text-xs">{w.segments}</td>
                <td className="px-3 py-2.5 text-right font-mono text-xs">{km(w.length)}</td>
                <td className="px-3 py-2.5 text-right font-mono text-xs">{acres(w.areaSqm)}</td>
                {CARD_KEYS.map((k) => (
                  <td key={k} className="px-3 py-2.5 text-right font-mono text-xs">
                    {w.cost[k as CostKey] > 0 ? inr(w.cost[k as CostKey]) : "—"}
                  </td>
                ))}
                <td className="px-3 py-2.5 text-right font-mono text-xs">{works}</td>
                <td className="px-3 py-2.5 text-right font-mono text-sm font-bold">{inr(w.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 bg-surface">
              <td colSpan={8} className="px-3 py-3 text-right font-mono text-[11px] font-bold uppercase tracking-wider">
                Grand total
              </td>
              <td />
              <td className="px-3 py-3 text-right font-display text-base font-bold text-gradient">
                {inr(grandTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </motion.div>
    </section>
  );
}
