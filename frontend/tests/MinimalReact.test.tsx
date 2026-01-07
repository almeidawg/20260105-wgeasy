import React from "react";
import { render, screen } from "@testing-library/react";

describe("Minimal React Test", () => {
  it("renders a simple div", () => {
    render(<div>Hello Test</div>);
    expect(screen.getByText("Hello Test")).toBeInTheDocument();
  });
});
