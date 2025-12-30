import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressiveImage, AvatarImage } from "../progressive-image";

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, onLoad, onError, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      {...props}
      onLoad={onLoad}
      onError={onError}
      data-testid="next-image"
    />
  ),
}));

describe("ProgressiveImage", () => {
  it("renders with skeleton initially", () => {
    const { container } = render(
      <ProgressiveImage
        src="/test.jpg"
        alt="Test image"
        width={200}
        height={100}
      />
    );

    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("accepts custom placeholder color", () => {
    const { container } = render(
      <ProgressiveImage
        src="/test.jpg"
        alt="Test image"
        width={200}
        height={100}
        placeholderColor="#ff0000"
      />
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders image with correct alt text", () => {
    render(
      <ProgressiveImage
        src="/test.jpg"
        alt="Test image"
        width={200}
        height={100}
      />
    );

    expect(screen.getByAltText("Test image")).toBeInTheDocument();
  });
});

describe("AvatarImage", () => {
  it("renders initials when no src provided", () => {
    render(<AvatarImage alt="User Avatar" name="John Doe" />);
    
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders single initial for one-word name", () => {
    render(<AvatarImage alt="User Avatar" name="John" />);
    
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("renders ? when no name provided", () => {
    render(<AvatarImage alt="User Avatar" />);
    
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("renders image when src is provided", () => {
    render(
      <AvatarImage
        src="/avatar.jpg"
        alt="User Avatar"
        name="John Doe"
      />
    );

    expect(screen.getByTestId("next-image")).toBeInTheDocument();
  });

  it("applies correct size class", () => {
    const { container } = render(
      <AvatarImage alt="User Avatar" name="JD" size="lg" />
    );

    expect(container.querySelector(".h-12.w-12")).toBeInTheDocument();
  });
});
