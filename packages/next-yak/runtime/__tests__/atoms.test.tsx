import { describe, expect, it } from "vitest";
import { atoms } from "../atoms";
import { ClassNames, css } from "../cssLiteral";
import type { RuntimeStyleProcessor } from "../publicStyledApi";

const classNamesOf = (processor: unknown, props: Record<string, unknown> = {}) => {
  const classNames = new ClassNames();
  (processor as RuntimeStyleProcessor<unknown>)(props, classNames, {});
  return classNames.value;
};

describe("atoms", () => {
  it("collects static classes, however they are grouped", () => {
    expect(classNamesOf(atoms("a b c"))).toBe("a b c");
    expect(classNamesOf(atoms("a", "b", "c"))).toBe("a b c");
    expect(classNamesOf(atoms("a b", "c"))).toBe("a b c");
  });

  it("skips falsy atoms", () => {
    expect(classNamesOf(atoms("a", false, "b"))).toBe("a b");
    expect(classNamesOf(atoms(false))).toBe("");
    expect(classNamesOf(atoms())).toBe("");
  });

  it("runs dynamic atoms after the static ones", () => {
    const processor = atoms<{ $active?: boolean }>("a", (props, classNames) => {
      if (props.$active) classNames.add("active");
    });
    expect(classNamesOf(processor, { $active: true })).toBe("a active");
    expect(classNamesOf(processor, { $active: false })).toBe("a");
  });

  it("keeps classes a dynamic atom removes removable", () => {
    const processor = atoms("a b", (_props, classNames) => {
      classNames.delete("a");
    });
    expect(classNamesOf(processor)).toBe("b");
  });

  it("is static on its own but dynamic once css() wraps it", () => {
    // styled`` compiles to css("yak123", atoms(...)) and gates its fast path on
    // the outer processor, which is dynamic because atoms() is a function - so
    // atoms' own $dynamic is not read today. Pinned to catch a fold of static
    // atoms into the outer class name, which would make the fast path reachable.
    expect((atoms("a") as unknown as { $dynamic: boolean }).$dynamic).toBe(false);
    // @ts-expect-error calling with a class name string mimics the compiled css form
    expect((css("yak123", atoms("a")) as unknown as { $dynamic: boolean }).$dynamic).toBe(true);
  });
});
