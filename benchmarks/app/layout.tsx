import { LogInp } from "./logInp";

export const metadata = {
  title: "CSS Benchmark for Yak",
  description: "Kanji Demo which renders 2500 Kanji characters",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <LogInp />
      </body>
    </html>
  );
}
