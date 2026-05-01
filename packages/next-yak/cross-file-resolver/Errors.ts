export class CauseError extends Error {
  circular?: boolean;
  constructor(message: string, options?: { cause?: unknown }) {
    super(
      `${message}${options?.cause ? `\n  Caused by: ${typeof options.cause === "object" && options.cause !== null && "message" in options.cause ? options.cause.message : String(options.cause)}` : ""}`,
    );

    if (options?.cause instanceof CauseError && options.cause.circular) {
      this.circular = true;
    }
  }
}

export class ResolveError extends CauseError {}

/**
 * Thrown for `unsupported` exports. Subclassed so the surrounding
 * `resolveModuleExport` catch can recognise that the error already
 * carries its own "Unable to resolve … in module …" wrapper and
 * doesn't need another one stacked on top.
 */
export class UnsupportedExportError extends ResolveError {}

export class CircularDependencyError extends CauseError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.circular = true;
  }
}
