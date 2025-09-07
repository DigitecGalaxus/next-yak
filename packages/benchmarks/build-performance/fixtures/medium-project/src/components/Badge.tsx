import styles from "./Badge.module.css";

export type BadgeProps = {
  children: React.ReactNode;
  variant?: "success" | "info" | "warning" | "danger";
  className?: string;
};

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export default function Badge({
  children,
  variant = "info",
  className,
}: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[variant], className)}>
      {children}
    </span>
  );
}
