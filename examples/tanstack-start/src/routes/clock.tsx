import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { Clock } from "../components/Clock";

const getClock = createServerFn().handler(async () => {
  const Renderable = await renderServerComponent(<Clock />);
  return { Renderable };
});

export const Route = createFileRoute("/clock")({
  loader: async () => {
    const { Renderable } = await getClock();
    return { Clock: Renderable };
  },
  component: ClockPage,
});

function ClockPage() {
  const { Clock } = Route.useLoaderData();
  return <>{Clock}</>;
}
