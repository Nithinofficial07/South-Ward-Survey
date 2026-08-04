import { createFileRoute } from "@tanstack/react-router";
import { CategoryBreakdown } from "@/components/ward/CategoryBreakdown";
import { PriorityWorks } from "@/components/ward/PriorityWorks";
import { TopWardsMarquee } from "@/components/ward/Footer";

export const Route = createFileRoute("/investment")({
  head: () => ({
    meta: [
      { title: "Investment Breakdown — Davanagere South Wards" },
      {
        name: "description",
        content:
          "Where the money goes: roads, drains, footpaths, gutters, water lines and signage costs across Davanagere South wards.",
      },
      { property: "og:title", content: "Investment Breakdown — Davanagere South Wards" },
      {
        property: "og:description",
        content: "Category-wise costed civic works and the highest-spending wards.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InvestmentPage,
});

function InvestmentPage() {
  return (
    <main className="pt-20">
      <CategoryBreakdown />
      <PriorityWorks />
      <TopWardsMarquee />
    </main>
  );
}
