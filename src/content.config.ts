import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const videoCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/videos' }),
  schema: z.object({
    id: z.number(),
    title: z.string(),
    attribution: z.string(),
    'attribution-link': z.string(),
    tags: z.array(z.string()),
    added: z.date(),
    platform: z.string(),
    'video-tags': z.array(z.string()),
    'source-link': z.string(),
    'tweet-text': z.string().optional(),
    'video-description': z.string().optional(),
    'video-title': z.string().optional()
  })
});

export const collections = {
  videos: videoCollection
};
