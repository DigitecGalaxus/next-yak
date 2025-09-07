import { css, styled } from "next-yak";

export type AlertProps = {
  title?: string;
  children?: React.ReactNode;
  variant?: "info" | "success" | "warning" | "danger";
  className?: string;
};

export default function Alert({
  title,
  children,
  variant = "info",
  className,
}: AlertProps) {
  return (
    <AlertComponent $variant={variant} className={className}>
      {title && <Title>{title}</Title>}
      {children && <Description>{children}</Description>}
    </AlertComponent>
  );
}

const AlertComponent = styled.div<{
  $variant: Exclude<AlertProps["variant"], undefined>;
}>`
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  padding: 12px 14px;
  display: grid;
  gap: 6px;

  ${({ $variant }) => {
    switch ($variant) {
      case "info":
        return css`
          background: rgba(64, 153, 255, 0.08);
          border-color: rgba(64, 153, 255, 0.35);
        `;
      case "success":
        return css`
          background: rgba(23, 201, 100, 0.08);
          border-color: rgba(23, 201, 100, 0.35);
        `;
      case "warning":
        return css`
          background: rgba(245, 165, 36, 0.12);
          border-color: rgba(245, 165, 36, 0.45);
        `;
      case "danger":
        return css`
          background: rgba(243, 18, 96, 0.08);
          border-color: rgba(243, 18, 96, 0.45);
        `;
    }
  }}
`;

const Title = styled.div`
  font-weight: 700;
`;

const Description = styled.div`
  color: var(--color-muted-fg);
`;
