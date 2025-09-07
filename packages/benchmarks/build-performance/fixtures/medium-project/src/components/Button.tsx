import Link from "next/link";
import styles from "./Button.module.css";

export type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  block?: boolean;
  disabled?: boolean;
  className?: string;
};

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  block,
  disabled,
  className,
}: ButtonProps) {
  const cls = cx(
    styles.button,
    styles[variant],
    styles[size],
    block && styles.block,
    disabled && styles.disabled,
    className,
  );
  if (href) {
    return (
      <Link className={cls} href={href} aria-disabled={disabled}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} disabled={disabled}>
      {children}
    </button>
  );
}
