import { css, __yak_unitPostFix, __yak_mixin } from "next-yak/internal";
// Exported dynamic mixin with a runtime css variable value.
// The payload references the producer-scoped variable (`var(--...)`) while
// the runtime template carries the setter - both keep the producer name at
// every usage site.
export const pad = /*YAK EXPORTED MIXIN V2:pad
padding: var(--input_pad__padding_m7uBBu);
margin: 0;
*/ /*#__PURE__*/ __yak_mixin((__yak_b)=>[
        {
            "style": {
                "--input_pad__padding_m7uBBu": /*#__PURE__*/ __yak_unitPostFix(({ $pad })=>$pad, "px")
            }
        }
    ]);
