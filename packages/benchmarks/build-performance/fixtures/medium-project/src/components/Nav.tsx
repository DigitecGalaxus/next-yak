import Link from "next/link";
import styles from "./Nav.module.css";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/team", label: "Team" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

import ThemeToggle from "./ThemeToggle";

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>Medium Project</div>
      <div className={styles.right}>
        <div className={styles.links}>
          {links.map((l) => (
            <Link className={styles.link} key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </div>
        <ThemeToggle />
      </div>
    </nav>
  );
}
