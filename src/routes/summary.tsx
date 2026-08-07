import { createFileRoute } from "@tanstack/react-router";
import { SummarySheet } from "@/components/ward/SummarySheet";

export const Route = createFileRoute("/summary")({
  head: () => ({
    meta: [
      { title: "Ward Summary Sheet — Davanagere South" },
      {
        name: "description",
        content: "Every ward in one spreadsheet-style table: roads, area, length, category costs and totals.",
      },
      { property: "og:title", content: "Ward Summary Sheet — Davanagere South" },
      {
        property: "og:description",
        content: "A full ward-by-ward summary table for the Davanagere South infrastructure register.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SummaryPage,
});

function SummaryPage() {
  return (
    <main className="pt-20">
      <SummarySheet />
    </main>
  );
}
