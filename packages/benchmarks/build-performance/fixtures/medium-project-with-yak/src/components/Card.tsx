import { styled } from "next-yak";

export type CardProps = {
  title: string;
  description: string;
  href?: string;
};

export default function Card({ title, description, href }: CardProps) {
  const content = (
    <CardComponent>
      <Title>{title}</Title>
      <Description>{description}</Description>
    </CardComponent>
  );
  if (href) {
    return (
      <a href={href} aria-label={title}>
        {content}
      </a>
    );
  }
  return content;
}

const CardComponent = styled.div`
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  background: var(--color-surface);
`;

const Title = styled.div`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 6px;
`;

const Description = styled.p`
  color: var(--color-muted-fg);
  font-size: 14px;
`;
