import { LandingPage } from "@/components/landingPage";
import { Metadata, ResolvingMetadata } from "next";

export const metadata: Metadata = {
  title: "Zero-runtime CSS-in-JS powered by Rust",
  description:
    "🦀 Zero-runtime CSS-in-JS powered by Rust. Write styled-components syntax, get build-time CSS extraction and full RSC compatibility.",
};

export default async function HomePage() {
  return <LandingPage />;
}
