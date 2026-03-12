import { styled } from "next-yak";

// Non-exported styled component with no CSS rules
// should still get a class so it can be used as a selector
const Container = styled.div``;

export const Wrapper = styled.div`
  ${Container} {
    color: red;
  }
`;
