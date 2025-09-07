import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { css, styled } from "next-yak";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Html lang="en">
      <Body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Nav />
        {children}
      </Body>
    </Html>
  );
}

const common = css`
  max-width: 100vw;
  overflow-x: hidden;
`;

const Html = styled.html`
  &[data-theme="light"] {
    --background: #ffffff;
    --foreground: #171717;
    --color-fg: var(--foreground);
    --color-muted-fg: rgba(0, 0, 0, 0.6);
    --color-border: rgba(0, 0, 0, 0.08);
    --color-surface: #f7f7f8;
    --color-surface-hover: #f0f0f1;
    --color-primary: #0a7cff;
    --color-primary-fg: #ffffff;
    --color-secondary: #eaeaea;
    --color-secondary-fg: #111111;
    --color-success: #17c964;
    --color-warning: #f5a524;
    --color-danger: #f31260;
  }

  &[data-theme="dark"] {
    --background: #0a0a0a;
    --foreground: #ededed;
    --color-fg: var(--foreground);
    --color-muted-fg: rgba(255, 255, 255, 0.8);
    --color-border: rgba(255, 255, 255, 0.12);
    --color-surface: #111213;
    --color-surface-hover: #1a1b1c;
    --color-primary: #4099ff;
    --color-primary-fg: #081018;
    --color-secondary: #1f1f20;
    --color-secondary-fg: #e7e7e7;
    --color-success: #2ecc71;
    --color-warning: #f5a524;
    --color-danger: #ff477e;
  }

  ${common};

  @media (prefers-color-scheme: dark) {
    color-scheme: dark;
  }
`;

const Body = styled.body`
  ${common};

  color: var(--color-fg);
  background: var(--color-bg);
  font-family: Arial, Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;
