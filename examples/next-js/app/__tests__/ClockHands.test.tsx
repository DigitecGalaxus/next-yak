/// <reference types="jest" />
import React from "react";
import { render } from "@testing-library/react";
import { ClockHands } from "../ClockHands";

test("renders ClockHands component", () => {
  const { asFragment } = render(<ClockHands />);
  expect(asFragment()).toMatchSnapshot();
});
