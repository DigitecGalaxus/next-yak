// Imports @yak/react without declaring styles, so the plugin emits no CSS import for this
// module. The Turbopack loader has to hand such modules back unchanged.
//
// The marker text below must stay the first `unde`+`fined` in this file — put that word
// anywhere above it and the guard stops guarding.
import { YakThemeProvider } from "@yak/react";

export function Marker() {
  return (
    <YakThemeProvider theme={{}}>
      <span data-testid="untouched">undefined</span>
    </YakThemeProvider>
  );
}
