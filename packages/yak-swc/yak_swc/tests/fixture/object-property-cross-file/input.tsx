import { styled } from "next-yak";

// Define styled components within an object
export const OtherComponents = {
  Title: styled.h1`
    font-size: 5rem;
    font-weight: 400;
    color: hotpink;
  `,
  Subtitle: styled.h2`
    font-size: 3rem;
    color: blue;
  `,
};

// Test using the object property component in the same file
const Container = styled.div`
  padding: 20px;
  
  ${OtherComponents.Title} {
    color: purple;
  }
  
  ${OtherComponents.Subtitle} {
    margin-top: 10px;
  }
`;

export default Container;