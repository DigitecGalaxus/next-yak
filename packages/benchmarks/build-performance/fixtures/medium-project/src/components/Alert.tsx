import styles from "./Alert.module.css";

export type AlertProps = {
  title?: string;
  children?: React.ReactNode;
  variant?: "info" | "success" | "warning" | "danger";
  className?: string;
};

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export default function Alert({
  title,
  children,
  variant = "info",
  className,
}: AlertProps) {
  return (
    <div className={cx(styles.alert, styles[variant], className)}>
      {title && <div className={styles.title}>{title}</div>}
      {children && <div className={styles.desc}>{children}</div>}
    </div>
  );
}
