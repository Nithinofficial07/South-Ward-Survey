import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

export function useCountUp(target: number, duration = 1400) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, duration]);

  return { ref, value };
}

export function CountUp({
  to,
  format,
  className,
}: {
  to: number;
  format?: ((n: number) => string) | undefined;
  className?: string | undefined;
}) {
  const { ref, value } = useCountUp(to);
  return (
    <span ref={ref} className={className}>
      {format ? format(value) : Math.round(value).toLocaleString("en-IN")}
    </span>
  );
}
