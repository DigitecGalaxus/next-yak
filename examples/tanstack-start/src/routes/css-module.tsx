import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { CssModuleGreeting } from "../components/CssModuleGreeting";

const getGreeting = createServerFn().handler(async () => {
  const Renderable = await renderServerComponent(<CssModuleGreeting />);
  return { Renderable };
});

export const Route = createFileRoute("/css-module")({
  loader: async () => {
    const { Renderable } = await getGreeting();
    return { Greeting: Renderable };
  },
  component: CssModulePage,
});

function CssModulePage() {
  const { Greeting } = Route.useLoaderData();
  return <>{Greeting}</>;
}
