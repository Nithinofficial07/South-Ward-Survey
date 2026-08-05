import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CONDITION_COLORS, inr, wardName, type Road } from "@/lib/ward-data";

function CondBadge({ cond }: { cond: string | null | undefined }) {
  const c = cond && CONDITION_COLORS[cond] ? cond : "Unknown";
  return (
    <span
      className="whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider"
      style={{ background: `color-mix(in oklab, ${CONDITION_COLORS[c]} 15%, transparent)`, color: CONDITION_COLORS[c] }}
    >
      {cond ?? "n/a"}
    </span>
  );
}

function Cost({ v }: { v: number }) {
  return <span className="font-mono text-xs font-semibold">{v > 0 ? inr(v) : "TBD"}</span>;
}

function TableShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-5">
      <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{title}</h4>
      <div className="mt-2 overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[560px] text-left text-xs">{children}</table>
      </div>
    </div>
  );
}

const th = "px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground";
const td = "px-3 py-2 align-top";

export function RoadDetailDialog({ road, onClose }: { road: Road | null; onClose: () => void }) {
  return (
    <Dialog open={road !== null} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
        {road && (
          <>
            <DialogHeader>
              <DialogTitle>
                Ward {String(road.w).padStart(2, "0")} — {wardName(road.w)}
              </DialogTitle>
              <div className="font-mono text-[11px] text-muted-foreground">
                #{road.no} · {road.m}
                {road.c && ` · ${road.c}`} · {road.a}
                {road.map && (
                  <a
                    href={road.map}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 inline-flex items-center gap-1 text-accent hover:underline"
                  >
                    Map <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </DialogHeader>

            <TableShell title="Road">
              <thead>
                <tr className="border-b bg-surface">
                  <th className={th}>#</th>
                  <th className={th}>Road</th>
                  <th className={th}>Use / Sign</th>
                  <th className={th}>Dist / Width</th>
                  <th className={th}>Material / Condition</th>
                  <th className={th}>Action</th>
                  <th className={th}>Estimation</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b last:border-0">
                  <td className={td}>{road.no}</td>
                  <td className={td}>
                    {road.m}
                    {road.c && ` · ${road.c}`}
                    <div className="text-muted-foreground">{road.a}</div>
                  </td>
                  <td className={td}>
                    {road.detail.use ?? "—"}
                    <div className="text-muted-foreground">Sign: {road.detail.sign ?? "—"}</div>
                  </td>
                  <td className={td}>
                    {road.d} m × {road.wd} m
                  </td>
                  <td className={td}>
                    {road.mat || "—"}
                    <div className="mt-1">
                      <CondBadge cond={road.cond} />
                    </div>
                  </td>
                  <td className={td}>{road.detail.road.action}</td>
                  <td className={td}>
                    <Cost v={road.detail.road.cost} />
                  </td>
                </tr>
              </tbody>
            </TableShell>

            <TableShell title="Attachment">
              <thead>
                <tr className="border-b bg-surface">
                  <th className={th}>Side</th>
                  <th className={th}>Type</th>
                  <th className={th}>Width</th>
                  <th className={th}>Condition</th>
                  <th className={th}>Notes</th>
                  <th className={th}>Estimation</th>
                </tr>
              </thead>
              <tbody>
                {road.detail.attach.map((s, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className={td}>{s.side}</td>
                    <td className={td}>{s.type ?? "—"}</td>
                    <td className={td}>{s.width != null ? `${s.width} m` : "—"}</td>
                    <td className={td}>
                      <CondBadge cond={s.cond} />
                    </td>
                    <td className={`${td} text-muted-foreground`}>{s.notes ?? "—"}</td>
                    <td className={td}>
                      <Cost v={s.cost} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableShell>

            <TableShell title="SWG (Storm Water Gutter)">
              <thead>
                <tr className="border-b bg-surface">
                  <th className={th}>Side</th>
                  <th className={th}>Type</th>
                  <th className={th}>Width</th>
                  <th className={th}>Condition</th>
                  <th className={th}>Notes</th>
                  <th className={th}>Estimation</th>
                </tr>
              </thead>
              <tbody>
                {road.detail.swg.map((s, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className={td}>{s.side}</td>
                    <td className={td}>{s.type ?? "—"}</td>
                    <td className={td}>{s.width != null ? `${s.width} m` : "—"}</td>
                    <td className={td}>
                      <CondBadge cond={s.cond} />
                    </td>
                    <td className={`${td} text-muted-foreground`}>{s.notes ?? "—"}</td>
                    <td className={td}>
                      <Cost v={s.cost} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableShell>

            <TableShell title="UGD (Underground Drain)">
              <thead>
                <tr className="border-b bg-surface">
                  <th className={th}>Existing</th>
                  <th className={th}>Type / Dia</th>
                  <th className={th}>Condition</th>
                  <th className={th}>Action</th>
                  <th className={th}>Estimation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={td}>{road.detail.ugd.existing ?? "—"}</td>
                  <td className={td}>
                    {road.detail.ugd.type ?? "—"}
                    {road.detail.ugd.dia != null && ` · ${road.detail.ugd.dia} mm`}
                  </td>
                  <td className={td}>
                    <CondBadge cond={road.detail.ugd.cond} />
                  </td>
                  <td className={td}>{road.detail.ugd.action}</td>
                  <td className={td}>
                    <Cost v={road.detail.ugd.cost} />
                  </td>
                </tr>
              </tbody>
            </TableShell>

            <TableShell title="Jalasiri">
              <thead>
                <tr className="border-b bg-surface">
                  <th className={th}>Existing</th>
                  <th className={th}>Condition</th>
                  <th className={th}>Notes</th>
                  <th className={th}>Action</th>
                  <th className={th}>Estimation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={td}>{road.detail.jal.existing ?? "—"}</td>
                  <td className={td}>
                    <CondBadge cond={road.detail.jal.cond} />
                  </td>
                  <td className={`${td} text-muted-foreground`}>{road.detail.jal.notes ?? "—"}</td>
                  <td className={td}>{road.detail.jal.action}</td>
                  <td className={td}>
                    <Cost v={road.detail.jal.cost} />
                  </td>
                </tr>
              </tbody>
            </TableShell>

            <TableShell title="Electrical">
              <thead>
                <tr className="border-b bg-surface">
                  <th className={th}>Light type</th>
                  <th className={th}>Condition</th>
                  <th className={th}>Notes</th>
                  <th className={th}>Estimation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={td}>{road.detail.elec.lightType ?? "—"}</td>
                  <td className={td}>
                    <CondBadge cond={road.detail.elec.cond} />
                  </td>
                  <td className={`${td} text-muted-foreground`}>{road.detail.elec.notes ?? "—"}</td>
                  <td className={td}>
                    <span className="font-mono text-xs text-muted-foreground">Rate TBD</span>
                  </td>
                </tr>
              </tbody>
            </TableShell>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
