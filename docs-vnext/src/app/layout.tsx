import type { Metadata, Viewport } from "next";
import Header from "../components/landing-page/header";
import PageFrame from "../components/page-frame";
import { SearchProvider } from "../components/search/search-provider";
import { NextProvider } from "fumadocs-core/framework/next";
import { styled } from "next-yak";
import "./global.css";
import { bricolageSans, hankenSans, initVars, jetbrainsMono, light, dark } from "@/tokens";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og/home.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og/home.png"],
  },
};

// Must match the Html background below (light.beige2 / dark.navy2)
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf5ef" },
    { media: "(prefers-color-scheme: dark)", color: "#2b273b" },
  ],
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
            <PageFrame>{children}</PageFrame>
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
  background: light-dark(${light.beige2}, ${dark.navy2});
  color: light-dark(${light.violetSoft}, ${dark.fog});

  /* Stops centred content shifting between short and long pages, and on dialog scroll lock */
  scrollbar-gutter: stable;
`;
