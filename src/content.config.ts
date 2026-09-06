import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blogs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blogs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Kalaris Labs Research Team'),
    authorRole: z.string().default('Research Scientist'),
    authorAvatar: z.string().default('/sayan-chowdhury.jpg'),
    category: z.string().default('Research'),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    readingTime: z.string().optional(),
    tldr: z.string().optional(),
    headerGradient: z.string().optional(),
    image: z.string().optional(),
  }),
});

const research = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/research' }),
  schema: z.object({
    title: z.string(),
    abstract: z.string(),
    pubDate: z.coerce.date(),
    authors: z.array(z.string()),
    category: z.string(),
    status: z.enum(['Preprint', 'Under Review', 'Accepted', 'Published', 'Working Paper']).default('Preprint'),
    doi: z.string().optional(),
    arxivId: z.string().optional(),
    pdfUrl: z.string().optional(),
    bibtex: z.string().optional(),
  }),
});

const changelog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/changelog' }),
  schema: z.object({
    version: z.string(),
    date: z.coerce.date(),
    title: z.string(),
    type: z.enum(['major', 'minor', 'patch']).default('minor'),
  }),
});

const customerStories = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/customer-stories' }),
  schema: z.object({
    title: z.string(),
    institution: z.string(),
    focus: z.string(),
    quote: z.string(),
    author: z.string(),
  }),
});

const partnerships = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/partnerships' }),
  schema: z.object({
    name: z.string(),
    type: z.string(),
    description: z.string(),
  }),
});

const programs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/programs' }),
  schema: z.object({
    title: z.string(),
    type: z.string(),
    deadline: z.string(),
    award: z.string(),
  }),
});

export const collections = {
  blogs,
  research,
  changelog,
  'customer-stories': customerStories,
  partnerships,
  programs,
};
