import styles from "./page.module.css";

export default function DashboardPage() {
  return (
    <div className={styles.container}>
      <h1>Dashboard</h1>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div>Builds</div>
          <div className={styles.value}>128</div>
        </div>
        <div className={styles.stat}>
          <div>Success</div>
          <div className={styles.value}>99.2%</div>
        </div>
        <div className={styles.stat}>
          <div>Time</div>
          <div className={styles.value}>12m</div>
        </div>
      </div>
    </div>
  );
}
