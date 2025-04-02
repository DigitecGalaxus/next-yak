import { PlaygroundPage } from "@/components/playgroundPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playground",
  description: "A playground to see how next-yak transpiles your code",
};

export default function Playground() {
  return <PlaygroundPage />;
}
