import { css, __yak_mixin } from "next-yak/internal";
// Records of dynamic mixins: every entry compiles to its own V2 template
// with a nameParts comment (variants:primary / variants:danger)
export const variants = {
    primary: /*YAK EXPORTED MIXIN V2:variants:primary
color: blue;
@yak-branch b0 {
  outline: 1px solid blue;
}
*/ /*#__PURE__*/ __yak_mixin((__yak_b)=>[
            ({ $active })=>$active && /*#__PURE__*/ css(__yak_b(0))
        ]),
    danger: /*YAK EXPORTED MIXIN V2:variants:danger
color: red;
@yak-branch b0 {
  outline: 1px solid red;
}
*/ /*#__PURE__*/ __yak_mixin((__yak_b)=>[
            ({ $active })=>$active && /*#__PURE__*/ css(__yak_b(0))
        ])
};
