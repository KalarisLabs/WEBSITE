import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const contentSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  publishDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  socialImage: z.string().optional(),
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
