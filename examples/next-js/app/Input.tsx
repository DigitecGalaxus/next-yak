import { styled } from "next-yak";

const Input = styled.input.attrs<{ $size?: string }>((props) => ({
  type: "text",
  $size: props.$size || "1rem",
}))<{ $size?: string }>`
  color: #bf4f74;
  font-size: 1em;
  border: 2px solid #bf4f74;
  border-radius: 3px;
  margin: 1rem;

  padding: ${(props) => props.$size};
`;

const PasswordInput = styled(Input).attrs({
  type: "password",
})`
  color: #167f8d;
  border: 2px solid #167f8d;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: background-color 0.5s ease-in-out;
  &:has(
    ${Input}:where(:hover, :focus),
    ${PasswordInput}:where(:hover, :focus)
  ) {
    background-color: #4c4c4cb9;
  }
`;

const Headline = styled.h2`
  color: #bf4f74;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;

  background-clip: text;
  background-image: linear-gradient(
    149deg,
    #ae52eb 0%,
    rgba(253, 29, 29, 1) 50%,
    rgba(252, 176, 69, 1) 100%
  );
  color: #eee;
  font-size: 2rem;
  font-weight: bold;
  padding: calc(1em / 16);
  -webkit-text-stroke-color: transparent;
  -webkit-text-stroke-width: calc(1em / 4);
`;

export const Inputs = () => {
  return (
    <Wrapper>
      <Headline>Styled Inputs</Headline>
      <Input placeholder="A small text input" />
      <Input $size="2rem" placeholder="A large text input" />
      <PasswordInput placeholder="A password input" />
      <PasswordInput $size="2rem" placeholder="A large password input" />
    </Wrapper>
  );
};
