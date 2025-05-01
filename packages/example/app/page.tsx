/** @jsxImportSource next-yak */
import { styled } from "next-yak";
import fs from "fs";
import { ClientExample, OtherButton } from "./client";

export default function Home() {
  console.log(fs);
  return (
    <main>
      <Button>TEST</Button>
      <ClientExample />
    </main>
  );
}

const Button = styled.button`
  color: yellow;
  ${OtherButton} {
    color: orange;
  }
`;
