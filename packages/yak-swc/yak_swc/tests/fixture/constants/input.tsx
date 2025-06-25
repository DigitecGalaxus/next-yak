import { styled } from "next-yak";

const colors = {
  primary: "#007bff",
  secondary: "#6c757d",
  success: "#28a745",
  danger: "#dc3545",
  warning: "#ffc107",
  info: "#17a2b8",
  light: "#f8f9fa",
  dark: "#343a40",
  "almost-black": "#212529",
  1: "#000000",
};

const borderRadius = "4px";
const stacking = 1;

export const Button = styled.button`
  background-color: ${colors.primary};
  color: ${colors.light};
  padding: 10px ${100 / 3}%;
  z-index: ${stacking};
  margin-top: ${-1}px;
  border: none;
  border-radius: ${borderRadius};
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  &:hover {
    background-color: ${colors.dark};
  }
  &:active {
    color: ${colors[1]};
    background-color: ${colors["almost-black"]};
  }
`;
