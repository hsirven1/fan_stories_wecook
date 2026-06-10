import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import App from "./App";

jest.mock("./shareCapture", () => {
  const actual = jest.requireActual("./shareCapture");
  return {
    ...actual,
    captureShareCardToPngBlob: jest.fn(async () => new Blob([new Uint8Array([137, 80, 78])], { type: "image/png" })),
  };
});

test("renders the opening slide", () => {
  render(<App />);
  expect(screen.getByText(/your year/i)).toBeInTheDocument();
  expect(screen.getByText(/with wecook/i)).toBeInTheDocument();
});

test("last slide mounts story capture host with header and export CTA", async () => {
  render(<App />);

  fireEvent.click(screen.getByTestId("progress-dot-7"));

  await waitFor(() => {
    expect(screen.getByRole("button", { name: /share my 2026 review|preparing/i })).toBeInTheDocument();
  });

  const captureHost = screen.getByTestId("share-capture-host");
  expect(captureHost.style.visibility).toBe("hidden");
  expect(captureHost.style.opacity).not.toBe("0.01");

  const exportStory = within(captureHost);
  expect(exportStory.getByText("Your 2026 Review")).toBeInTheDocument();
  expect(exportStory.getByText("Try wecook")).toBeInTheDocument();
  expect(exportStory.getByText(/REVIEW2026/)).toBeInTheDocument();
});
