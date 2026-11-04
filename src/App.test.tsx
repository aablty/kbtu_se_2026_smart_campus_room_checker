import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

function setTime(labelPattern: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(labelPattern), { target: { value } });
}

describe("App integration — F3, F4, F5", () => {
  it("F3: a blocked room (B-204) is reported unavailable even for a non-overlapping, valid slot", () => {
    render(<App />);

    fireEvent.click(screen.getByText(/B-204/));
    setTime(/Current time/, "08:00");
    setTime(/Start time/, "10:00");
    setTime(/End time/, "10:30");
    fireEvent.click(screen.getByRole("button", { name: /check availability/i }));

    expect(screen.getByText(/currently blocked and cannot be booked/i)).toBeInTheDocument();
  });

  it("F5: switching the selected room clears the previous availability result", () => {
    render(<App />);

    setTime(/Current time/, "08:00");
    setTime(/Start time/, "10:00");
    setTime(/End time/, "10:30");
    fireEvent.click(screen.getByRole("button", { name: /check availability/i }));
    expect(screen.getByText(/open and ready to book/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/C-310/));
    expect(
      screen.getByText(/select a room and enter a time interval/i),
    ).toBeInTheDocument();
  });

  it("F4: an impossible attendee requirement shows the empty state and no room cards", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/minimum attendees/i), {
      target: { value: "1000" },
    });

    expect(screen.getByText(/no rooms match your current requirements/i)).toBeInTheDocument();
    expect(screen.queryByText(/A-101/)).not.toBeInTheDocument();
  });

  it("F1+F2 integration: filtering by capacity and equipment narrows the visible room list", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/minimum attendees/i), {
      target: { value: "20" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Projector" }));

    expect(screen.getAllByText(/A-101/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/C-310/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/D-105/)).not.toBeInTheDocument();
  });
});
