import { styled } from "@yak/solid";

// the url is relative to this file, one directory below index.tsx
export const ImageBox = styled.div`
  width: 40px;
  height: 40px;
  background: url("./assets/same-file.png") no-repeat center / contain;
`;
