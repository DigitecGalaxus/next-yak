import Alert from "@/components/Alert";
import Button from "@/components/Button";
import { spacings } from "@/styles/spacings.yak";
import { radius } from "@/styles/tokens.yak";
import { css, styled } from "next-yak";

export default function ContactPage() {
  return (
    <Container>
      <h1>Contact</h1>
      <Alert variant="info">We usually respond within 1–2 business days.</Alert>
      <Form>
        <Input placeholder="Your email" />
        <TextArea placeholder="Message" rows={4} />
        <SendButton variant="primary" size="md">
          Send
        </SendButton>
      </Form>
    </Container>
  );
}

const Container = styled.div`
  padding: ${spacings[24]};
  display: grid;
  gap: ${spacings[16]};
`;

const Form = styled.form`
  display: grid;
  gap: ${spacings[8]};
  max-width: 480px;
`;

const input = css`
  padding: ${spacings[10]} ${spacings[12]};
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: ${radius.md};

  @media (prefers-color-scheme: dark) {
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const Input = styled.input`
  ${input}
`;

const TextArea = styled.textarea`
  ${input}
`;

const SendButton = styled(Button)`
  padding: ${spacings[10]} ${spacings[12]};
  border-radius: ${radius.md};
  background: var(--foreground);
  color: var(--background);
`;
