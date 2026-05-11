import { Metadata } from "next";

export const metadata: Metadata = {
  title: "next-yak benchmarks",
  description:
    "Side-by-side runtime comparison of next-yak and styled-components on the CodSpeed benchmark suite.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
