import { describe, it, expect } from "vitest";
import {
    generatePageMetadata,
    defaultMetadata,
} from "../seo";

describe("SEO Utilities", () => {
    describe("generatePageMetadata", () => {
        it("generates metadata with correct title format", () => {
            const metadata = generatePageMetadata({
                title: "Tasks",
                description: "Manage your tasks",
            });

            expect(metadata.title).toBe("Tasks | Ordo Todo");
        });

        it("includes description", () => {
            const metadata = generatePageMetadata({
                title: "Projects",
                description: "Manage your projects efficiently",
            });

            expect(metadata.description).toBe("Manage your projects efficiently");
        });

        it("sets noindex when specified", () => {
            const metadata = generatePageMetadata({
                title: "Settings",
                description: "User settings",
                noIndex: true,
            });

            expect(metadata.robots).toBe("noindex, nofollow");
        });

        it("sets index by default", () => {
            const metadata = generatePageMetadata({
                title: "Dashboard",
                description: "View your dashboard",
            });

            expect(metadata.robots).toBe("index, follow");
        });

        it("includes OpenGraph data", () => {
            const metadata = generatePageMetadata({
                title: "Habits",
                description: "Track your habits",
                path: "/habits",
            });

            expect(metadata.openGraph).toBeDefined();
            expect((metadata.openGraph as any)?.title).toBe("Habits | Ordo Todo");
        });

        it("includes Twitter card data", () => {
            const metadata = generatePageMetadata({
                title: "Analytics",
                description: "View analytics",
            });

            expect(metadata.twitter).toBeDefined();
            expect((metadata.twitter as any)?.card).toBe("summary_large_image");
        });

        it("generates alternate language URLs", () => {
            const metadata = generatePageMetadata({
                title: "Tasks",
                description: "Tasks page",
                path: "/tasks",
            });

            expect(metadata.alternates?.languages).toHaveProperty("es");
            expect(metadata.alternates?.languages).toHaveProperty("en");
            expect(metadata.alternates?.languages).toHaveProperty("pt-br");
        });
    });

    describe("defaultMetadata", () => {
        it("has metadataBase", () => {
            expect(defaultMetadata.metadataBase).toBeDefined();
        });

        it("has title template", () => {
            expect(defaultMetadata.title).toBeDefined();
        });

        it("has description", () => {
            expect(defaultMetadata.description).toBeDefined();
        });

        it("has keywords", () => {
            expect(defaultMetadata.keywords).toBeDefined();
            expect(Array.isArray(defaultMetadata.keywords)).toBe(true);
        });

        it("has OpenGraph configuration", () => {
            expect(defaultMetadata.openGraph).toBeDefined();
            expect((defaultMetadata.openGraph as any)?.type).toBe("website");
        });

        it("has Twitter configuration", () => {
            expect(defaultMetadata.twitter).toBeDefined();
        });

        it("has robots configuration", () => {
            expect(defaultMetadata.robots).toBeDefined();
        });

        it("has icons configuration", () => {
            expect(defaultMetadata.icons).toBeDefined();
        });

        it("has manifest", () => {
            expect(defaultMetadata.manifest).toBe("/manifest.json");
        });
    });
});
