import { createFileRoute } from "@tanstack/react-router";
import { ConditionSection } from "@/components/ward/ConditionSection";

export const Route = createFileRoute("/condition")({
  head: () => ({
    meta: [
      { title: "Road Condition Status — Davanagere South" },
      {
        name: "description",
        content:
          "Condition split of surveyed roads in Davanagere South: good, needs maintenance, works required and unknown.",
      },
      { property: "og:title", content: "Road Condition Status — Davanagere South" },
      {
        property: "og:description",
        content: "How the surveyed road network stands today, by condition category.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConditionPage,
});

function ConditionPage() {
  return (
    <main className="pt-20">
      <ConditionSection />
    </main>
  );
}
