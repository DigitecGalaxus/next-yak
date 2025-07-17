import { styled } from "next-yak";
import DefaultComponent from "./external-component";

// Component that targets a default exported styled component from another file
export const TestCard = styled.div`
  border: 1px solid #ddd;
  padding: 15px;
  
  /* Target default exported component */
  ${DefaultComponent} {
    background: lightblue;
    color: white;
  }
`;