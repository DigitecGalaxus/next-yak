import styles from "./CssModuleGreeting.module.css";

export function CssModuleGreeting() {
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.headline}>Hello from CSS Modules RSC</h1>
    </div>
  );
}
