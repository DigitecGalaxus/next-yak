// @ts-nocheck
// The SWC plugin folds JSX usages of fully static styled components
// declared in the same file into plain DOM elements, e.g.
// `<Card>hi</Card>` becomes `<div className="yX">hi</div>`.
// These tests verify that the folded output renders the exact same DOM
// as the runtime wrapper component it replaces.
import { render } from "@testing-library/react";
import React from "react";
import { expect, it } from "vitest";
import { css as cssFn } from "../cssLiteral";
import { mergeClassNames } from "../internals/mergeClassNames";
import { styled as styledFn } from "../styled";

// A fully static styled component as compiled by the SWC plugin
const Card = styledFn("div")("yakClass");
// A dynamic class-toggling styled component - its usages fold to the
// inlined condition e.g. <Toggle $active={on} /> becomes
// <span className={"toggleBase" + (on ? " toggleOn" : "")} />
const Toggle = styledFn("span")("toggleBase", ({ $active }) => $active && cssFn("toggleOn"));
// A fully static styled(Component) wrapper - its usages fold to the
// wrapped component with the static class name
const Base = (props) => <p {...props} />;
const Extended = styledFn(Base)("extendedClass");
const ExtendedCard = styledFn(Card)("extendedCardClass");

const renderedHtml = (element) => render(element).container.innerHTML;
// sorted because the runtime puts the incoming className first while the
// fold puts the static class first - the class names are unique so the
// order is irrelevant
const renderedClassNames = (element) =>
  [...render(element).container.firstChild.classList].sort();

it("renders the same DOM as a plain usage", () => {
  expect(renderedHtml(<div className="yakClass">hi</div>)).toEqual(renderedHtml(<Card>hi</Card>));
});

it("renders the same DOM with forwarded attributes", () => {
  const onClick = () => {};
  const forwarded = {
    style: { margin: "1px" },
    onClick,
    "data-x": "1",
    title: "card",
  };
  expect(renderedHtml(<div {...forwarded} className="yakClass" />)).toEqual(
    renderedHtml(<Card {...forwarded} />),
  );
});

it("renders the same class names when merging a className", () => {
  expect(renderedClassNames(<div className={mergeClassNames("yakClass", "user")} />)).toEqual(
    renderedClassNames(<Card className="user" />),
  );
});

it("ignores falsy class names", () => {
  const active = false;
  expect(renderedHtml(<div className={mergeClassNames("yakClass", active && "active")} />)).toEqual(
    '<div class="yakClass"></div>',
  );
});

it("renders the same DOM as the wrapped component with the static class", () => {
  expect(renderedHtml(<Base className="extendedClass">hi</Base>)).toEqual(
    renderedHtml(<Extended>hi</Extended>),
  );
});

it("renders the same class names as a wrapped yak component", () => {
  expect(renderedClassNames(<Card className="extendedCardClass">hi</Card>)).toEqual(
    renderedClassNames(<ExtendedCard>hi</ExtendedCard>),
  );
});

it("renders the same DOM as the runtime for inlined $prop conditions", () => {
  // truthy - the class-toggling condition adds the class
  expect(renderedHtml(<span className={"toggleBase" + (true ? " toggleOn" : "")} />)).toEqual(
    renderedHtml(<Toggle $active />),
  );
  // falsy - only the base class remains
  expect(renderedHtml(<span className={"toggleBase" + (false ? " toggleOn" : "")} />)).toEqual(
    renderedHtml(<Toggle $active={false} />),
  );
  // absent $props count as undefined (spreads never fold)
  expect(renderedHtml(<span className={"toggleBase" + (void 0 ? " toggleOn" : "")} />)).toEqual(
    renderedHtml(<Toggle />),
  );
  // the $prop is dropped from the folded element like the runtime strips it
  expect(renderedHtml(<Toggle $active />)).toEqual('<span class="toggleBase toggleOn"></span>');
});

it("keeps only the static class for undefined class names", () => {
  expect(mergeClassNames("yakClass", undefined)).toBe("yakClass");
  expect(mergeClassNames("yakClass", null)).toBe("yakClass");
  expect(mergeClassNames("yakClass", "")).toBe("yakClass");
  expect(mergeClassNames("yakClass", "user extra")).toBe("yakClass user extra");
});
