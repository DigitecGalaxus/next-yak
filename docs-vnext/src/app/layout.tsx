import type { Metadata } from "next";
import Header from "../components/landing-page/header";
import { SearchProvider } from "../components/search/search-provider";
import { NextProvider } from "fumadocs-core/framework/next";
import { styled } from "next-yak";
import "./global.css";
import { bricolageSans, colors, hankenSans, initVars, jetbrainsMono } from "@/tokens";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/yak-hero.png", width: 1248, height: 832, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/yak-hero.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Html
      lang="en"
      // a pre-paint script in <body> may set color-scheme on <html>; let React leave it be
      suppressHydrationWarning
      className={`${hankenSans.className} ${bricolageSans.variable} ${jetbrainsMono.variable} ${hankenSans.variable}`}
    >
      <NextProvider>
        <body>
          <script
            dangerouslySetInnerHTML={{
              __html: setTheme,
            }}
          />
          <SearchProvider>
            <Header />
            {children}
          </SearchProvider>
        </body>
      </NextProvider>
    </Html>
  );
}

const setTheme = `
try{
  var t = localStorage.getItem('theme');
  if (t === 'light' || t === 'dark')
    document.documentElement.dataset.theme = t;
} catch(e) {}`;

const Html = styled.html`
  ${initVars};
  background: ${colors.beige};
  color: ${colors.violetLight};
`;
