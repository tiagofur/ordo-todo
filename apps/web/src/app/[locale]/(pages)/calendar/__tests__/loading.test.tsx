import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

// AppLayout pulls next-intl navigation, unresolvable under vitest; the
// loading boundary composes it the same way TasksPageSkeleton does.
vi.mock("@/components/shared/app-layout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import CalendarLoading, { CalendarLoadingContent } from "../loading";

describe("CalendarLoadingContent", () => {
  it("mirrors the calendar layout with header, grid and aside placeholders", () => {
    const { container } = render(<CalendarLoadingContent />);
    const pulses = container.querySelectorAll(".animate-pulse");
    // Header block + 7 weekday heads + week rows + aside items
    expect(pulses.length).toBeGreaterThan(15);
  });

  it("stays silent for assistive tech (delegates to Skeleton aria-hidden)", () => {
    const { container } = render(<CalendarLoadingContent />);
    const hidden = container.querySelectorAll('[aria-hidden="true"]');
    expect(hidden.length).toBeGreaterThan(0);
  });

  it("composes the default export inside the app layout", () => {
    const { container } = render(<CalendarLoading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(15);
  });
});
