import { createFileRoute } from "@tanstack/react-router";
import { RoadRegister } from "@/components/ward/RoadRegister";

export const Route = createFileRoute("/roads")({
  head: () => ({
    meta: [
      { title: "Street-Level Road Register — Davanagere South" },
      {
        name: "description",
        content:
          "Search and filter every surveyed road segment in Davanagere South by ward, locality and estimated cost.",
      },
      { property: "og:title", content: "Street-Level Road Register — Davanagere South" },
      {
        property: "og:description",
        content: "A searchable database of surveyed road segments with map links.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoadsPage,
});

function RoadsPage() {
  return (
    <main className="pt-20">
      <RoadRegister />
    </main>
  );
}
