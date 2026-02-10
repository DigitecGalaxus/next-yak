import { styled } from "next-yak";
import { buttonMixin } from "./mixin.tsx";
import { primaryButtonMixin } from "./helper/anotherMixin.tsx";
import { Icon } from "./icon.tsx";

const Button = styled.button`
  ${buttonMixin};
`;

const PrimaryButton = styled(Button)`
  ${primaryButtonMixin};
`;

export default function App() {
  return (
    <>
      <Button data-testid="button">
        <Icon data-testid="button-icon">*</Icon>
        Button
      </Button>
      <PrimaryButton data-testid="primary-button">
        <Icon data-testid="primary-icon">*</Icon>
        Primary
      </PrimaryButton>
    </>
  );
}
