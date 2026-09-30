import React from 'react';
import { styled } from "@yak/react";

const ThemedComponent = styled.div`
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
  padding: 20px;
  border-radius: 8px;
`;
