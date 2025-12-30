/// <reference types="jest" />
import React from "react";
import { render } from "@testing-library/react";
import { Clock } from "../Clock";

test("renders Clock component", () => {
  const { asFragment } = render(<Clock />);
  expect(asFragment()).toMatchSnapshot();
});
