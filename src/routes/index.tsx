import { createFileRoute } from "@tanstack/react-router";
import { Portfolio } from "@/components/portfolio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Banupriya M — Full Stack Developer" },
      { name: "description", content: "Portfolio of Banupriya M, Full Stack Developer skilled in React, Node.js, Express, Python and SQL." },
      { property: "og:title", content: "Banupriya M — Full Stack Developer" },
      { property: "og:description", content: "Projects, experience and skills of Banupriya M, Full Stack Developer from Chennai." },
    ],
  }),
  component: Portfolio,
});
