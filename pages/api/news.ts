import type { NextApiRequest, NextApiResponse } from 'next';
import Parser from 'rss-parser';
import { NewsArticle } from '../../types/news';

const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
      ['media:thumbnail', 'thumbnail'],
    ],
  },
});

// Simple in-memory cache
let cachedNews: NewsArticle[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const currentTime = Date.now();

  try {
    if (cachedNews.length > 0 && currentTime - lastFetchTime < CACHE_DURATION) {
      return res.status(200).json(cachedNews);
    }

    const feed = await parser.parseURL('https://myanimelist.net/rss/news.xml');
    
    interface MALRSSItem {
      link?: string;
      guid?: string;
      title?: string;
      thumbnail?: string;
      pubDate?: string;
      creator?: string;
      contentSnippet?: string;
      contentEncoded?: string;
      content?: string;
      categories?: string[];
    }

    cachedNews = feed.items.map((item: MALRSSItem) => {
      // Create a URL-friendly slug from the link or guid
      // MAL links look like: https://myanimelist.net/news/74087264
      const newsId = item.link?.split('/news/').pop()?.split('?')[0] || 
                     item.guid?.split('/news/').pop()?.split('?')[0];
      
      const slug = newsId || item.title?.replace(/\W+/g, '-').toLowerCase();

      // MAL often puts the thumbnail link directly in media:thumbnail
      // Sometimes it's in enclosure, but media:thumbnail is standard for MAL RSS
      const imageUrl = item.thumbnail;

      // Decode basic entities in title and snippet
      const cleanTitle = item.title?.replace(/&#039;/g, "'")
                                  .replace(/&quot;/g, '"')
                                  .replace(/&amp;/g, '&') || 'Untitled Dispatch';

      return {
        id: slug || Math.random().toString(36).substring(7),
        url: item.link || '',
        title: cleanTitle,
        date: item.pubDate || new Date().toISOString(),
        author_username: item.creator || 'MAL Staff',
        excerpt: item.contentSnippet?.replace(/<[^>]*>?/gm, '').slice(0, 180).trim() + '...' || '',
        content: (item.contentEncoded || item.content || '').replace(/&#039;/g, "'").replace(/&quot;/g, '"'),
        image: imageUrl || undefined,
        categories: item.categories || [],
      };
    });

    lastFetchTime = currentTime;
    res.status(200).json(cachedNews);
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    res.status(500).json({ message: 'Failed to fetch news feed' });
  }
}
