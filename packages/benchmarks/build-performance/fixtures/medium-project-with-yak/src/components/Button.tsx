import Link from "next/link";
import { css, styled } from "next-yak";

export type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  block?: boolean;
  disabled?: boolean;
  className?: string;
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  block,
  disabled,
  className,
}: ButtonProps) {
  const common = {
    $variant: variant,
    $size: size,
    $block: block,
    $disabled: disabled,
  };
  if (href) {
    return (
      <ButtonLink
        {...common}
        className={className}
        href={href}
        aria-disabled={disabled}
      >
        {children}
      </ButtonLink>
    );
  }
  return (
    <ButtonComponent {...common} className={className} disabled={disabled}>
      {children}
    </ButtonComponent>
  );
}

type Props = {
  $variant: ButtonProps["variant"];
  $size: ButtonProps["size"];
  $block: ButtonProps["block"];
  $disabled: ButtonProps["disabled"];
};

const commonStyles = css<Props>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  border: 1px solid transparent;
  font-weight: 600;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;

  ${({ $size }) => {
    switch ($size) {
      case "sm":
        return css`
          height: 32px;
          padding: 0 12px;
          font-size: 12px;
        `;
      case "md":
        return css`
          height: 40px;
          padding: 0 16px;
          font-size: 14px;
        `;
      case "lg":
        return css`
          height: 48px;
          padding: 0 20px;
          font-size: 16px;
        `;
    }
  }}

  ${({ $variant }) => {
    switch ($variant) {
      case "primary":
        return css`
          background: var(--color-primary);
          color: var(--color-primary-fg);

          &:hover {
            filter: brightness(0.95);
          }
        `;
      case "secondary":
        return css`
          background: var(--color-secondary);
          color: var(--color-secondary-fg);

          &:hover {
            background: var(--color-surface-hover);
            border-color: var(--color-border);
          }
        `;
      case "ghost":
        return css`
          background: transparent;
          color: var(--color-fg);
          border-color: var(--color-border);

          &:hover {
            background: var(--color-surface);
          }
        `;
    }
  }}

  ${({ $block }) =>
    $block &&
    css`
      width: 100%;
    `}

  ${({ $disabled }) =>
    $disabled &&
    css`
      opacity: 0.6;
      pointer-events: none;
    `}
`;

const ButtonLink = styled(Link)<Props>`
  ${commonStyles};
`;

const ButtonComponent = styled.button<Props>`
  ${commonStyles};
`;
