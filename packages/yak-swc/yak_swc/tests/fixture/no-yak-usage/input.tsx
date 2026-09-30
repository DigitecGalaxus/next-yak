// Should not add an import to the .css module as no css has been extracted

import { styled } from "@yak/react";

export const isYak = typeof styled === "function";