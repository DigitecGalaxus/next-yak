import { YakConfigOptions } from "../../withYak/index.js";

/**
 * Extracts CSS content from code that contains YAK-generated CSS comments.
 * Parses the input code and returns the extracted CSS, optionally adding
 * a cssmodules directive based on the transpilation mode.
 */
export function extractCss(
  code: string | Buffer<ArrayBufferLike>,
  transpilationMode: NonNullable<
    YakConfigOptions["experiments"]
  >["transpilationMode"],
): string {
  let codeString: string;

  if (typeof code === "string") {
    codeString = code;
  } else if (code instanceof Buffer) {
    codeString = code.toString("utf-8");
  } else if (code instanceof ArrayBuffer) {
    codeString = new TextDecoder("utf-8").decode(code);
  } else {
    throw new Error(
      "Invalid input type: code must be string, Buffer, or ArrayBuffer",
    );
  }

  const codeParts = codeString.split("/*YAK Extracted CSS:\n");
  let result = "";
  for (let i = 1; i < codeParts.length; i++) {
    const codeUntilEnd = codeParts[i].split("*/")[0];
    result += codeUntilEnd;
  }
  if (result && transpilationMode !== "Css") {
    result = "/* cssmodules-pure-no-check */\n" + result;
  }

  return result;
}
