import Image from "next/image";
import { css, styled } from "next-yak";

export default function Home() {
  return (
    <Page>
      <Main>
        <Logo
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>src/app/page.tsx</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <Ctas>
          <Link
            $variant="primary"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Logo
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </Link>
          <Link
            $variant="secondary"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </Link>
        </Ctas>
      </Main>
      <Footer>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </Footer>
    </Page>
  );
}

const Page = styled.div`
  --gray-rgb: 0, 0, 0;
  --gray-alpha-200: rgba(var(--gray-rgb), 0.08);
  --gray-alpha-100: rgba(var(--gray-rgb), 0.05);

  --button-primary-hover: #383838;
  --button-secondary-hover: #f2f2f2;

  display: grid;
  grid-template-rows: 20px 1fr 20px;
  align-items: center;
  justify-items: center;
  min-height: 100svh;
  padding: 80px;
  gap: 64px;
  font-family: var(--font-geist-sans);

  @media (prefers-color-scheme: dark) {
    .page {
      --gray-rgb: 255, 255, 255;
      --gray-alpha-200: rgba(var(--gray-rgb), 0.145);
      --gray-alpha-100: rgba(var(--gray-rgb), 0.06);

      --button-primary-hover: #ccc;
      --button-secondary-hover: #1a1a1a;
    }
  }

  @media (max-width: 600px) {
    padding: 32px;
    padding-bottom: 80px;
  }
`;

const Main = styled.main`
  display: flex;
  flex-direction: column;
  gap: 32px;
  grid-row-start: 2;

  & ol {
    font-family: var(--font-geist-mono);
    padding-left: 0;
    margin: 0;
    font-size: 14px;
    line-height: 24px;
    letter-spacing: -0.01em;
    list-style-position: inside;
  }
  & li:not(:last-of-type) {
    margin-bottom: 8px;
  }

  & code {
    font-family: inherit;
    background: var(--gray-alpha-100);
    padding: 2px 4px;
    border-radius: 4px;
    font-weight: 600;
  }

  @media (max-width: 600px) {
    padding: 32px;
    padding-bottom: 80px;

    & ol {
      text-align: center;
    }
  }
`;

const Ctas = styled.div`
  display: flex;
  gap: 16px;

  & a {
    appearance: none;
    border-radius: 128px;
    height: 48px;
    padding: 0 20px;
    border: 1px solid transparent;
    transition:
      background 0.2s,
      color 0.2s,
      border-color 0.2s;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    line-height: 20px;
    font-weight: 500;
  }

  @media (max-width: 600px) {
    flex-direction: column;

    & a {
      font-size: 14px;
      height: 40px;
      padding: 0 16px;
    }
  }
`;

const Link = styled.a<{ $variant: "primary" | "secondary" }>`
  ${({ $variant }) =>
    $variant === "primary"
      ? css`
          background: var(--foreground);
          color: var(--background);
          gap: 8px;

          @media (hover: hover) and (pointer: fine) {
            &:hover {
              background: var(--button-primary-hover);
              border-color: transparent;
            }
          }
        `
      : css`
          border-color: var(--gray-alpha-200);
          min-width: 158px;

          @media (hover: hover) and (pointer: fine) {
            &:hover {
              background: var(--button-secondary-hover);
              border-color: transparent;
            }
          }

          @media (max-width: 600px) {
            min-width: auto;
          }
        `}
`;

const Footer = styled.footer`
  grid-row-start: 3;
  display: flex;
  gap: 24px;

  & a {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  & img {
    flex-shrink: 0;
  }

  @media (hover: hover) and (pointer: fine) {
    & a:hover {
      text-decoration: underline;
      text-underline-offset: 4px;
    }
  }

  @media (max-width: 600px) {
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
  }
`;

const Logo = styled(Image)`
  @media (prefers-color-scheme: dark) {
    filter: invert();
  }
`;
