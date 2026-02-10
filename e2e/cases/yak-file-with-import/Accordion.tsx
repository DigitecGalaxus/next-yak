import { styled } from "next-yak";
import { spacing } from "./spacings.yak.ts";

const AccordionBox = styled.div`
  padding: ${spacing}px;
`;

export function Accordion() {
  return <AccordionBox data-testid="accordion">Accordion</AccordionBox>;
}
