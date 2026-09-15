import { component$ } from "@qwik.dev/core";
import { QwikRouterProvider, RouterOutlet } from "@qwik.dev/router";

export default component$(() => (
  <QwikRouterProvider>
    <head>
      <meta charset="utf-8" />
      <title>next-yak e2e</title>
    </head>
    <body>
      <div id="root">
        <RouterOutlet />
      </div>
    </body>
  </QwikRouterProvider>
));
