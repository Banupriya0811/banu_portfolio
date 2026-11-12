import { createFileRoute } from "@tanstack/react-router";
import { Portfolio } from "@/components/portfolio";
import { getRemotePortfolioDataFn } from "@/lib/portfolio-server";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const res = await getRemotePortfolioDataFn();
      return { initialData: res?.data ?? null };
    } catch {
      return { initialData: null };
    }
  },
  head: () => ({
    meta: [
      { title: "Banupriya M — Full Stack Developer" },
      {
        name: "description",
        content:
          "Portfolio of Banupriya M, Full Stack Developer skilled in React, Node.js, Express, Python and SQL.",
      },
      { property: "og:title", content: "Banupriya M — Full Stack Developer" },
      {
        property: "og:description",
        content:
          "Projects, experience and skills of Banupriya M, Full Stack Developer from Chennai.",
      },
    ],
  }),
  component: IndexRoute,
});

function IndexRoute() {
  const { initialData } = Route.useLoaderData();
  return <Portfolio initialData={initialData} />;
}
