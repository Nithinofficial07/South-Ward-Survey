import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/ward/Hero";
import { TopWardsMarquee } from "@/components/ward/Footer";
import { totals } from "@/lib/ward-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Davanagere South Ward Infrastructure Register | DVG South Ward Data" },
      {
        name: "description",
        content: `Explore road, drain, footpath and signage data for all ${totals.wards} wards of Davanagere South constituency, with costed estimates from a street-level field survey.`,
      },
      { property: "og:title", content: "Davanagere South Ward Infrastructure Register" },
      {
        property: "og:description",
        content: `${totals.wards} wards, ${totals.segments.toLocaleString("en-IN")} road segments, costed civic works — an interactive ward-by-ward infrastructure register for DVG South.`,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <Hero />
      <TopWardsMarquee />
    </main>
  );
}
