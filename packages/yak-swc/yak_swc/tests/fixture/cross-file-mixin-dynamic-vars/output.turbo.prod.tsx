import { css, __yak_unitPostFix, __yak_mixin } from "next-yak/internal";
// Exported dynamic mixin with a runtime css variable value.
// The payload references the producer-scoped variable (`var(--...)`) while
// the runtime template carries the setter - both keep the producer name at
// every usage site.
export const pad = /*YAK EXPORTED MIXIN V2:pad
padding: var(--ym7uBBu1);
margin: 0;
*/ /*#__PURE__*/ __yak_mixin((__yak_b)=>[
        {
            "style": {
                "--ym7uBBu1": /*#__PURE__*/ __yak_unitPostFix(({ $pad })=>$pad, "px")
            }
        }
    ]);
