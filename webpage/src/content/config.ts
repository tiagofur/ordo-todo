import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const pages = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/pages",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    heroTitle: z.string(),
    heroSubtitle: z.string(),
    ctaText: z.string(),
  }),
});

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/blog",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string(),
    tags: z.array(z.string()),
  }),
});

const features = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/features",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string(),
    category: z.enum([
      "ai",
      "productivity",
      "collaboration",
      "time-management",
      "habits",
      "okrs",
    ]),
    featured: z.boolean().default(false),
  }),
});

const testimonials = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/testimonials",
  }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    company: z.string(),
    content: z.string(),
    avatar: z.string().url().optional(),
    rating: z.number().min(1).max(5).default(5),
  }),
});

export const collections = { pages, blog, features, testimonials };
