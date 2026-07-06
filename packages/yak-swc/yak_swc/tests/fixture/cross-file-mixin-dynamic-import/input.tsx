import { styled } from "next-yak";
// @ts-ignore
import { highlight } from "./highlight";

// A cross-file mixin used at statement position (top level of the template).
// The transform can not know whether `highlight` is static or dynamic, so it
// - encodes a usage-site scope prefix into the css marker for the resolver
// - passes the imported value through __yak_use at runtime (no-op for static mixins)
export const Button = styled.button`
  padding: 10px;
  ${highlight};
  color: green;
`;
