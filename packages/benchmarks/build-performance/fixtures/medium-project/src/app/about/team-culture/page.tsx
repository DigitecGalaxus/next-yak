import styles from "./page.module.css";

export default function TeamCulturePage() {
  return (
    <div className={styles.container}>
      <h1>Team Culture</h1>
      <p>
        Remote-first, async by default, low-meeting culture that values focus
        time.
      </p>
      <div className={styles.badges}>
        <span className={styles.badge}>Remote</span>
        <span className={styles.badge}>Flexible</span>
        <span className={styles.badge}>Inclusive</span>
      </div>
    </div>
  );
}
