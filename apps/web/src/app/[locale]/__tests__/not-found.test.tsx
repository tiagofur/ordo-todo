import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "../not-found";

// Mock next-intl navigation
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: "Page not found",
      description: "Sorry, the page you are looking for does not exist or has been moved.",
      goToDashboard: "Go to Dashboard",
      goToHome: "Back to Home",
    };
    return translations[key] ?? key;
  },
}));

describe("NotFound Page", () => {
  it("renders 404 heading", () => {
    render(<NotFound />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });

  it("renders helpful message", () => {
    render(<NotFound />);

    expect(
      screen.getByText(/Sorry, the page you are looking for does not exist/i)
    ).toBeInTheDocument();
  });

  it("has navigation buttons", () => {
    render(<NotFound />);

    expect(screen.getByRole("link", { name: /Go to Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to Home/i })).toBeInTheDocument();
  });

  it("has correct link destinations", () => {
    render(<NotFound />);

    const dashboardLink = screen.getByRole("link", { name: /Go to Dashboard/i });
    const homeLink = screen.getByRole("link", { name: /Back to Home/i });

    expect(dashboardLink).toHaveAttribute("href", "/dashboard");
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
