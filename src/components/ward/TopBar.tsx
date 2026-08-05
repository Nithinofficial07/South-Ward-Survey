import { motion, useScroll, useSpring } from "motion/react";
import { Link } from "@tanstack/react-router";
import { BarChart3, Building2, FileText, MapPinned, TrendingUp } from "lucide-react";

const LINKS = [
  { to: "/", label: "Home", icon: Building2 },
  { to: "/wards", label: "Wards", icon: MapPinned },
  { to: "/investment", label: "Estimates", icon: TrendingUp },
  { to: "/condition", label: "Status", icon: BarChart3 },
  { to: "/roads", label: "Breakdown", icon: FileText },
] as const;

export function TopBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });

  return (
    <>
      <motion.div
        style={{ scaleX }}
        className="fixed inset-x-0 top-0 z-50 h-1 origin-left bg-gradient-to-r from-[var(--lime)] via-[var(--amber)] to-[var(--coral)]"
      />
      <header className="fixed inset-x-0 top-1 z-40">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-4">
          <Link
            to="/"
            className="truncate rounded-full border border-[oklch(1_0_0/0.2)] bg-[oklch(0.2_0.04_210/0.75)] px-4 py-2 font-display text-sm font-bold text-[oklch(0.97_0.02_180)] backdrop-blur-md"
          >
            DVG SOUTH · WARD DATA
          </Link>
          <nav className="hidden gap-1 rounded-full border border-[oklch(1_0_0/0.2)] bg-[oklch(0.2_0.04_210/0.55)] px-2 py-1.5 backdrop-blur-md sm:flex">
            {LINKS.map((l) => {
              const Icon = l.icon;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  activeProps={{ className: "bg-[oklch(1_0_0/0.18)]" }}
                  className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-[oklch(0.94_0.02_180)] transition hover:bg-[oklch(1_0_0/0.14)]"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <nav className="fixed inset-x-0 bottom-3 z-40 mx-auto flex w-[calc(100%-2rem)] max-w-sm justify-between gap-1 rounded-full border border-[oklch(1_0_0/0.2)] bg-[oklch(0.2_0.04_210/0.75)] px-2 py-1.5 backdrop-blur-md sm:hidden">
        {LINKS.map((l) => {
          const Icon = l.icon;
          return (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "bg-[oklch(1_0_0/0.18)]" }}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-medium text-[oklch(0.94_0.02_180)]"
            >
              <Icon className="h-3 w-3" />
              {l.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
