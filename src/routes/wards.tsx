import { createFileRoute } from "@tanstack/react-router";
import { WardGrid } from "@/components/ward/WardGrid";
import { totals } from "@/lib/ward-data";

export const Route = createFileRoute("/wards")({
  head: () => ({
    meta: [
      { title: `All ${totals.wards} Wards — Davanagere South Infrastructure` },
      {
        name: "description",
        content:
          "Ward-by-ward infrastructure cards for Davanagere South: segments, road length, costed works and top localities in each ward.",
      },
      { property: "og:title", content: `All ${totals.wards} Wards — Davanagere South Infrastructure` },
      {
        property: "og:description",
        content: "Expandable cards for every ward with cost breakdowns and top localities.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WardsPage,
});

function WardsPage() {
  return (
    <main className="pt-20">
      <WardGrid />
    </main>
  );
}
