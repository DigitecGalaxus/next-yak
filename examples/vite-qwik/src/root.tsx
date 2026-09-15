import { component$, useContextProvider, useStore } from "@qwik.dev/core";
import { QwikRouterProvider, RouterOutlet } from "@qwik.dev/router";
import { YakThemeContext } from "@yak/qwik";
import { getYakThemeContext } from "@yak/qwik/context/baseContext";
import "./globals.ts";

export default component$(() => {
  // the theme is a store: the toggle writes into it and every themed style
  // re-renders, no page reload needed
  const theme = useStore({ ...getYakThemeContext() });
  useContextProvider(YakThemeContext, theme);
  return (
    <QwikRouterProvider>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Yak with Qwik 2 + Vite Example</title>
      </head>
      <body>
        <RouterOutlet />
      </body>
    </QwikRouterProvider>
  );
});
