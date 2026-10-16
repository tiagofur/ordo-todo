import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "../error-boundary";

// Mutable flag controlling whether ThrowError throws. This allows
// changing the behavior before the ErrorBoundary retries rendering.
let shouldThrowFlag = true;

// Component that throws an error based on the mutable flag
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow && shouldThrowFlag) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
}

describe("ErrorBoundary", () => {
  // Suppress console.error for expected errors
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    shouldThrowFlag = true;
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders fallback UI when error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should show error UI
    expect(screen.getByText("Algo salió mal")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Intentar de nuevo/i })).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom error UI")).toBeInTheDocument();
  });

  it("calls onError callback when error occurs", () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it("resets error state when retry button is clicked", () => {
    shouldThrowFlag = true;

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Error UI should be visible
    expect(screen.getByText("Algo salió mal")).toBeInTheDocument();

    // Stop the component from throwing before clicking retry,
    // so the ErrorBoundary can successfully re-render its children.
    shouldThrowFlag = false;

    // Click retry button
    fireEvent.click(screen.getByRole("button", { name: /Intentar de nuevo/i }));

    // Should show children again
    expect(screen.getByText("No error")).toBeInTheDocument();
  });
});
