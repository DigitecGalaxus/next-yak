// Replaced by tsdown with the name in package.json, see tsdown.config.ts
declare const __YAK_PACKAGE_NAME__: string | undefined;

/**
 * The name this package is published under: "next-yak" or its successor "@yak/react".
 */
export const packageName: string =
  typeof __YAK_PACKAGE_NAME__ === "string" ? __YAK_PACKAGE_NAME__ : "next-yak";
