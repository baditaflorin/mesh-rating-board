import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { createMockRoom } from "@baditaflorin/mesh-common/testing";
import { Feature } from "../../src/Feature";
import { config } from "../../src/config";

describe("Feature (component)", () => {
  it("renders a decision-ready room reading when connected", () => {
    const room = createMockRoom();
    render(<Feature room={room} config={config} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "How is the room feeling?" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Live board")).toBeInTheDocument();
    expect(screen.getByText("Awaiting the first signal")).toBeInTheDocument();
  });

  it("shows a connecting state when room is null", () => {
    render(<Feature room={null} config={config} />);

    expect(screen.getByText("Joining room")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rate 3 stars" })).toBeDisabled();
  });

  it("lets this peer choose a five-star rating and updates the live reading", () => {
    const room = createMockRoom({ peerId: "rater" });
    render(<Feature room={room} config={config} />);

    fireEvent.click(screen.getByRole("button", { name: "Rate 5 stars" }));

    expect(screen.getByRole("button", { name: "Rate 5 stars" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("5.0")).toBeInTheDocument();
    expect(screen.getAllByText("1 response")).toHaveLength(2);
    expect(screen.getByText(/Your 5 \/ 5 signal is live/)).toBeInTheDocument();
  });
});
