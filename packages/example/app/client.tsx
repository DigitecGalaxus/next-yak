"use client";

import { styled } from "next-yak";

export const ClientExample = () => {
  return (
    <div>
      <h1>Hello World</h1>
      <OtherButton>TEST</OtherButton>
    </div>
  );
};

export const OtherButton = styled.button`
  color: orange;
`;
