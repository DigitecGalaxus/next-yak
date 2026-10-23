import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/site";

// `/docs/react` is the short address of the React setup guide on share cards and in talks. The
// static export cannot send a server redirect, so this page forwards with a meta refresh, and
// its canonical and `noindex` keep search engines on `/docs/getting-started`
const TARGET = "/docs/getting-started";

export const metadata: Metadata = {
  title: "Set up yak for React",
  alternates: { canonical: TARGET },
  robots: { index: false, follow: true },
};

export default function ReactRedirect() {
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${absoluteUrl(TARGET)}`} />
      <p>
        The React guide lives at <Link href={TARGET}>Getting started</Link>.
      </p>
    </>
  );
}
