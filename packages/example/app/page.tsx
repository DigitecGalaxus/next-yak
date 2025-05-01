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
      <Test>TEST</Test>
    </main>
  );
}

const Button = styled.button`
  color: yellow;
  // uncomment this to see if cross module import work (or don't)
  // ${OtherButton} {
  // color: orange;
  // }
`;

const Test = styled.button`
  color: blue;
`;
