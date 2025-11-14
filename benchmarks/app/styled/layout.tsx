import StyledComponentsRegistry from "./registry";

export default function StyledLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
    html { box-sizing: border-box; }
    *, *::before, *::after { box-sizing: inherit; }
    `,
        }}
      />
      <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
    </>
  );
}
