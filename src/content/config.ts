// 1. Import utilities from `astro:content`
import { z, defineCollection } from 'astro:content';
// 2. Define your collection(s)
const videoCollection = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.number(),
    title: z.string(),
    channel: z.string(),
    tags: z.array(z.string()),
    added: z.date(),
    platform: z.string(),
    'video-tags': z.array(z.string()),
    'source-link': z.string()
  })
});
// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = {
  videos: videoCollection
};
