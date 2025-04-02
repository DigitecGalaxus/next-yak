import { styled } from "next-yak";
import Image from "next/image";
import yakPlayground from "@/public/img/yak-playground.jpg";

export const PlaygroundPage = () => {
  return (
    <Wrapper>
      <ImageWrapper>
        <StyledImage
          src={yakPlayground}
          alt="Sad yak in a playground"
          fill
          sizes="(max-width: 768px) 80vw, 400px"
          priority
        />
      </ImageWrapper>
      <Callout>Sorry</Callout>
      <p>
        Currently, the playground cannot run in the browser due to a technical
        limitation in SWC's WebAssembly support.
      </p>
      <p>
        SWC plugins (which next-yak uses for CSS extraction) are not yet
        compatible with browser environments. You can track this limitation in
        the SWC issue tracker:
      </p>
      <Link
        href="https://github.com/swc-project/swc/issues/3934"
        target="_blank"
      >
        Support plugins in @swc/wasm-* #3934
      </Link>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 0 2rem;
  max-width: 75ch;
  margin: 4rem auto;

  & > p + p {
    margin-top: 1rem;
  }
`;

const Callout = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin: 2rem 0 1rem;
`;

const Link = styled.a`
  display: block;
  margin: 1rem auto;
  text-align: center;
  text-decoration: underline;
`;

const StyledImage = styled(Image)`
  border-radius: 100%;
  object-fit: cover;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 80%;
  max-width: 400px;
  margin: 0 auto 2rem;
  aspect-ratio: 1;
`;
