import { createFileRoute } from "@tanstack/react-router";
import Case from "../../cases/[case-name]/index.tsx";

export const Route = createFileRoute("/[case-name]")({
  component: Case,
});
