// @ts-ignore
import styled from "styled-components";
import { styled as styledYak } from "@yak/react";

const textColor = "red";

// Should be transformed as it is yak
export const CustomThemedButton = styledYak.button`
  color: blue;
`; 

// Should not be transformed as it is NOT yak
export const StyledComponent = styled.button`
  color: ${textColor};
`