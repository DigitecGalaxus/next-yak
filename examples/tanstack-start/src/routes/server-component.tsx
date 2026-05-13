import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { GreetingPlain } from "../components/GreetingPlain";

const getGreeting = createServerFn().handler(async () => {
  const Renderable = await renderServerComponent(<GreetingPlain />);
  return { Renderable };
});

export const Route = createFileRoute("/server-component")({
  loader: async () => {
    const { Renderable } = await getGreeting();
    return { Greeting: Renderable };
  },
  component: ServerComponentPage,
});

function ServerComponentPage() {
  const { Greeting } = Route.useLoaderData();
  return <>{Greeting}</>;
}
