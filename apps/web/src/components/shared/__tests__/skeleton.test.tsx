import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Skeleton,
  CardSkeleton,
  TaskCardSkeleton,
  PageHeaderSkeleton,
  StatsSkeleton,
  PageLoading,
} from "../skeleton";

describe("Skeleton Components", () => {
  describe("Skeleton", () => {
    it("renders with default classes", () => {
      render(<Skeleton />);
      const skeleton = document.querySelector(".animate-pulse");
      expect(skeleton).toBeInTheDocument();
    });

    it("accepts custom className", () => {
      render(<Skeleton className="h-10 w-20" />);
      const skeleton = document.querySelector(".h-10.w-20");
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe("CardSkeleton", () => {
    it("renders card skeleton structure", () => {
      render(<CardSkeleton />);
      // Should have multiple skeleton elements
      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("TaskCardSkeleton", () => {
    it("renders grid view by default", () => {
      const { container } = render(<TaskCardSkeleton />);
      expect(container.querySelector(".rounded-xl")).toBeInTheDocument();
    });

    it("renders list view when specified", () => {
      const { container } = render(<TaskCardSkeleton viewMode="list" />);
      expect(container.querySelector(".flex.items-center")).toBeInTheDocument();
    });
  });

  describe("PageHeaderSkeleton", () => {
    it("renders page header skeleton", () => {
      render(<PageHeaderSkeleton />);
      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("StatsSkeleton", () => {
    it("renders 4 stat cards", () => {
      render(<StatsSkeleton />);
      // Should have grid with 4 children
      const grid = document.querySelector(".grid");
      expect(grid).toBeInTheDocument();
      expect(grid?.children.length).toBe(4);
    });
  });

  describe("PageLoading", () => {
    it("renders full page loading state", () => {
      render(<PageLoading />);
      // Should have multiple elements
      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(10);
    });

    it("has fade-in animation", () => {
      const { container } = render(<PageLoading />);
      expect(container.querySelector(".animate-in")).toBeInTheDocument();
    });
  });
});
