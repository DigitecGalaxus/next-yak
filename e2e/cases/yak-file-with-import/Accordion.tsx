import { styled } from "@yak/react";
import { spacing } from "./spacings.yak.ts";

const AccordionBox = styled.div`
  padding: ${spacing}px;
`;

export function Accordion() {
  return <AccordionBox data-testid="accordion">Accordion</AccordionBox>;
}
