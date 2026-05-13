import { styled } from "next-yak";
import { useState } from "react";

export const Counter = () => {
  const [count, setCount] = useState(0);
  return (
    <Wrapper>
      <p>Count: {count}</p>
      <Button onClick={() => setCount((c) => c + 1)}>Increment</Button>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background: #e85d04;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  &:hover {
    background: #d45303;
  }
`;
