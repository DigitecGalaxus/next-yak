import styles from "./page.module.css";

const members = [
  { name: "Ari", role: "Engineering" },
  { name: "Bea", role: "Design" },
  { name: "Chen", role: "Product" },
  { name: "Drew", role: "DX" },
];

export default function TeamPage() {
  return (
    <div className={styles.container}>
      <h1>Team</h1>
      <div className={styles.grid}>
        {members.map((m) => (
          <div key={m.name} className={styles.card}>
            <strong>{m.name}</strong>
            <div className={styles.role}>{m.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
