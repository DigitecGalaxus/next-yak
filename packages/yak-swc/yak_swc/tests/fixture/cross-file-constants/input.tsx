import { styled } from "next-yak";
import { colors } from "./colorDefinitions";
import { fonts } from "./fontDefinitions";
import { sizes } from "./sizeDefinitions";
import * as constants from "./otherConstants";
import { s as renamedSize } from "./moreSizes";
import defaultImport from "./betterFontSizes";

export const Button = styled.button`
  font-size: ${fonts.sm};
  color: ${colors.dark.primary};
  border-color: ${colors.shadows.dark.primary};
  background-color: ${colors.light["full opacity"]};
  height: ${sizes[0]};
  padding: ${constants.spacing};
  margin: ${renamedSize.medium.top} ${renamedSize.medium.right};
  line-height: ${defaultImport.lineHeight[0]};
`;
