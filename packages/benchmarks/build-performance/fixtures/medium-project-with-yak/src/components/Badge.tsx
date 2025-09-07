import { styled } from "next-yak";

export type BadgeProps = {
  children: React.ReactNode;
  variant?: "success" | "info" | "warning" | "danger";
  className?: string;
};

export default function Badge({
  children,
  variant = "info",
  className,
}: BadgeProps) {
  return (
    <BadgeComponent $variant={variant} className={className}>
      {children}
    </BadgeComponent>
  );
}

const BadgeComponent = styled.span<{
  $variant: Exclude<BadgeProps["variant"], undefined>;
}>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  border: 1px solid var(--color-border);
  background: var(--color-surface);

  ${({ $variant }) => {
    switch ($variant) {
      case "success":
        return `
          color: #0f7a3f;
          border-color: rgba(26, 183, 92, 0.35);
          background: rgba(23, 201, 100, 0.12);
        `;
      case "info":
        return `
          color: #0f4a92;
          border-color: rgba(64, 153, 255, 0.35);
          background: rgba(64, 153, 255, 0.12);
        `;
      case "warning":
        return `
          color: #8a5a00;
          border-color: rgba(245, 165, 36, 0.45);
          background: rgba(245, 165, 36, 0.16);
        `;
      case "danger":
        return `
          color: #8a1238;
          border-color: rgba(243, 18, 96, 0.35);
          background: rgba(243, 18, 96, 0.12);
        `;
    }
  }}
`;
