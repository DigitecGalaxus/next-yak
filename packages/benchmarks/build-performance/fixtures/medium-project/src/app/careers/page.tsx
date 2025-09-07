import styles from "./page.module.css";

const roles = [
  { title: "Senior Frontend Engineer", location: "Remote" },
  { title: "Product Designer", location: "Remote" },
  { title: "Developer Advocate", location: "Remote" },
];

export default function CareersPage() {
  return (
    <div className={styles.container}>
      <h1>Careers</h1>
      <div className={styles.list}>
        {roles.map((r) => (
          <div key={r.title} className={styles.item}>
            <strong>{r.title}</strong>
            <div>{r.location}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
