import { Metadata } from "next";

export const metadata: Metadata = {
  title: "yak benchmarks",
  description:
    "Side-by-side runtime comparison of yak and styled-components on the benchmark suite.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
