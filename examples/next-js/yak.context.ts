import { cookies } from "next/headers";

export async function getYakThemeContext() {
  const cookieStore = await cookies();
  return {
    highContrast: cookieStore.get("highContrast")?.value === "true",
  };
}

declare module "@yak/react" {
  export interface YakTheme extends Awaited<ReturnType<typeof getYakThemeContext>> {}
}
