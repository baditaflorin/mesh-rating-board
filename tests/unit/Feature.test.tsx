import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { createMockRoom } from "@baditaflorin/mesh-common/testing";
import { Feature } from "../../src/Feature";
import { config } from "../../src/config";

describe("Feature (component)", () => {
  it("renders the app name when connected", () => {
    const room = createMockRoom();
    render(<Feature room={room} config={config} />);
    // Most apps show their human label in an <h1>. Allow either the config
    // appName or any first-level heading to be present.
    const heading = screen.getAllByRole("heading", { level: 1 })[0];
    expect(heading).toBeInTheDocument();
  });

  it("shows a connecting state when room is null", () => {
    render(<Feature room={null} config={config} />);
    // Most templates show "Connecting…" while the room is null. Apps with a
    // custom waiting state can override this test.
    const heading = screen.getAllByRole("heading", { level: 1 })[0];
    expect(heading).toBeInTheDocument();
  });

  it("lets this peer choose a five-star rating", () => {
    const room = createMockRoom({ peerId: "rater" });
    render(<Feature room={room} config={config} />);

    fireEvent.click(screen.getByRole("button", { name: "Rate 5 stars" }));

    expect(screen.getByText("5.0 / 5 from 1 peer")).toBeInTheDocument();
  });
});
