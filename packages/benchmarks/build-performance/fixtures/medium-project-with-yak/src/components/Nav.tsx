import Link from "next/link";

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
import { styled } from "next-yak";

export default function Nav() {
  return (
    <Navigation>
      <Logo>Medium Project</Logo>
      <Right>
        <Links>
          {links.map((l) => (
            <LinkComponent key={l.href} href={l.href}>
              {l.label}
            </LinkComponent>
          ))}
        </Links>
        <ThemeToggle />
      </Right>
    </Navigation>
  );
}

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
`;

const Logo = styled.div`
  font-weight: 700;
`;

const Right = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Links = styled.div`
  display: flex;
  gap: 16px;
`;

const LinkComponent = styled(Link)`
  opacity: 0.9;
  &:hover {
    text-decoration: underline;
  }
`;
