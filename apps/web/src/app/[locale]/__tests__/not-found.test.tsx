import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "../not-found";

// Mock next-intl navigation
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe("NotFound Page", () => {
  it("renders 404 heading", () => {
    render(<NotFound />);
    
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Página no encontrada")).toBeInTheDocument();
  });

  it("renders helpful message", () => {
    render(<NotFound />);
    
    expect(
      screen.getByText(/Lo sentimos, la página que buscas no existe/i)
    ).toBeInTheDocument();
  });

  it("has navigation buttons", () => {
    render(<NotFound />);
    
    expect(screen.getByRole("link", { name: /Ir al Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Volver al Inicio/i })).toBeInTheDocument();
  });

  it("has correct link destinations", () => {
    render(<NotFound />);
    
    const dashboardLink = screen.getByRole("link", { name: /Ir al Dashboard/i });
    const homeLink = screen.getByRole("link", { name: /Volver al Inicio/i });
    
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
