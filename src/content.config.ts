import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const contentSchema = z.object({
  title: z.string().min(1),
  seoTitle: z.string().min(1).max(65).optional(),
  description: z.string().min(1),
  publishDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  socialImage: z.string().optional(),
  // Person slugs from src/data/people.ts; posts without one are the founder's.
  authors: z.array(z.string()).min(1).default(['sayan-chowdhury']),
});

export const collections = {
  blog: defineCollection({
    loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
    schema: contentSchema,
  }),
  research: defineCollection({
    loader: glob({ base: './src/content/research', pattern: '**/*.{md,mdx}' }),
    schema: contentSchema,
  }),
};
