import { styled } from "@yak/react";
import { asset } from "@/lib/site";
import { radii } from "@/tokens";

// One image per theme. The visibility rules match the theme toggle: `data-theme` on <html> wins,
// without it the OS preference decides.
export function ThemeImage({
  light,
  dark,
  alt,
  width,
  height,
}: {
  light: string;
  dark: string;
  alt: string;
  width: number;
  height: number;
}) {
  return (
    <>
      <LightImage src={asset(light)} alt={alt} width={width} height={height} />
      <DarkImage src={asset(dark)} alt={alt} width={width} height={height} />
    </>
  );
}

const Image = styled.img`
  display: block;
  max-width: 100%;
  height: auto;
  margin: 32px 0;
  border-radius: ${radii.card};
`;

const LightImage = styled(Image)`
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme]) & {
      display: none;
    }
  }

  [data-theme="dark"] & {
    display: none;
  }
`;

const DarkImage = styled(Image)`
  display: none;

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme]) & {
      display: block;
    }
  }

  [data-theme="dark"] & {
    display: block;
  }
`;
