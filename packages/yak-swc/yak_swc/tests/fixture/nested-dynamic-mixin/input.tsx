import { styled, css } from "next-yak";

// example taken from https://github.com/DigitecGalaxus/next-yak/issues/208 

const spacing = "20px";

const ContainerFluid = styled.div`
  position: relative;
  margin: 0 auto;
  padding-top: ${spacing};
  max-width: 100%;

  ${({ $isApp, $pageHeaderHeight }) => 
    $isApp ? css`
      margin-top: unset;
    ` : css`
      margin-top: ${$pageHeaderHeight}px;
    `};

  margin-top: ${({ $pageHeaderHeight }) => $pageHeaderHeight}px;
`;