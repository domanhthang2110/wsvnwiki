import { NextRequest, NextResponse } from 'next/server';
import RSSParser from 'rss-parser';
import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import * as cheerio from 'cheerio';
import { EventItem } from '@/types/events';
import { Translate } from '@google-cloud/translate/build/src/v2';

// --- Constants ---
const RSS_URL = 'https://forum.warspear-online.com/index.php?/forum/23-news-announcements.xml/';
const CACHE_DIR = path.join(process.cwd(), '.cache');
const RAW_CACHE_FILE = path.join(CACHE_DIR, 'raw_events.json');
const TRANSLATED_CACHE_FILE = path.join(CACHE_DIR, 'translated_events.json');
const CACHE_TTL = 3600*1000; // Set to 0 for debugging, can be restored later
const ITEMS_PER_PAGE = 10;
const MAX_CACHED_ITEMS = 20;

// --- Types ---
interface RawCacheData {
  timestamp: number;
  guids: string[];
  items: EventItem[];
}

interface TranslatedCacheData {
  [page: number]: {
    timestamp: number;
    items: EventItem[];
  };
}

// --- Helper Functions ---
function getTranslateClient(): Translate {
  if (!process.env.GOOGLE_CLOUD_API_KEY) {
    throw new Error('GOOGLE_CLOUD_API_KEY is not set in environment variables.');
  }
  return new Translate({ key: process.env.GOOGLE_CLOUD_API_KEY });
}

async function readCache<T>(file: string): Promise<T | null> {
  try {
    if (fs.existsSync(file)) {
      const data = await fs.promises.readFile(file, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading cache file ${file}:`, error);
  }
  return null;
}

async function writeCache<T>(file: string, data: T): Promise<void> {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      await fs.promises.mkdir(CACHE_DIR, { recursive: true });
    }
    await fs.promises.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing cache file ${file}:`, error);
  }
}

function cleanHtmlContent(html: string): string {
  if (!html) return '';
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const elements = document.querySelectorAll('*');
  elements.forEach(element => {
    const htmlElement = element as HTMLElement;
    htmlElement.style.removeProperty('background-color');
    htmlElement.style.removeProperty('background');
    htmlElement.style.removeProperty('text-shadow');
  });
  return document.body.innerHTML;
}

async function translateText(text: string, debugInfo: { translationApiCallCount: number }, targetLanguage: string = 'vi'): Promise<string> {
  if (!text || text.trim() === '') return text;
  try {
    debugInfo.translationApiCallCount++;
    const translate = getTranslateClient();
    const [translation] = await translate.translate(text, targetLanguage);
    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}

async function translateAndSanitizeHTML(htmlContent: string, debugInfo: { translationApiCallCount: number }, targetLanguage: string = 'vi'): Promise<string> {
  if (!htmlContent || htmlContent.trim() === '') return htmlContent;
  try {
    debugInfo.translationApiCallCount++;
    const { window } = new JSDOM('');
    const purify = DOMPurify(window);
    const sanitizedHtml = purify.sanitize(htmlContent, { USE_PROFILES: { html: true } });
    const translate = getTranslateClient();
    const [translation] = await translate.translate(sanitizedHtml, targetLanguage);
    return translation;
  } catch (error) {
    console.error('HTML translation and sanitization error:', error);
    return htmlContent;
  }
}

// --- Main GET Function ---
export async function GET(request: NextRequest) {
  // const debugInfo = {
  //   fetchStatus: 'pending',
  //   newPostsFound: false,
  //   usedRawCache: false,
  //   usedTranslatedCache: false,
  //   cacheTimestamp: 0,
  //   translationApiCallCount: 0,
  //   errorDetails: '',
  // };

  try {
    const now = Date.now();
    let rawCache = await readCache<RawCacheData>(RAW_CACHE_FILE);
    let translatedCache = await readCache<TranslatedCacheData>(TRANSLATED_CACHE_FILE) || {};

    // Step 1: Check if the raw cache is stale and needs fetching
    if (!rawCache || now - rawCache.timestamp > CACHE_TTL) {
      // debugInfo.usedRawCache = false;
      const rawXmlResponse = await fetch(RSS_URL);
      if (!rawXmlResponse.ok) {
        throw new Error(`Failed to fetch raw RSS: ${rawXmlResponse.status}`);
      }
      // debugInfo.fetchStatus = 'succeed';
      const rawXmlText = await rawXmlResponse.text();
      const parser = new RSSParser();
      const feed = await parser.parseString(rawXmlText);

      const fetchedGuids = feed.items.map(item => item.guid || item.link || '').filter(Boolean);
      const cachedGuids = rawCache?.guids || [];

      const hasNewPosts = JSON.stringify([...fetchedGuids].sort()) !== JSON.stringify([...cachedGuids].sort());
      // debugInfo.newPostsFound = hasNewPosts;

      if (hasNewPosts || !rawCache) {
        console.log('New posts found or raw cache empty. Processing raw feed...');
        const tempProcessedItems = feed.items.map(item => {
          let descriptionHtml = item.content || item.description || '';
          if (descriptionHtml) {
            const $ = cheerio.load(descriptionHtml);
            $('span[style*="color:#006633"]').css('color', 'white');
            $('span[style*="color:#8e44ad"]').css('color', 'yellow');
            $('span[style*="color:#d35400"]').css('color', 'white');
            descriptionHtml = cleanHtmlContent($.html());
          }
          return {
            title: item.title || 'No Title',
            link: item.link || '',
            description: descriptionHtml,
            originalDescription: descriptionHtml,
            pubDate: item.pubDate || new Date().toISOString(),
            author: item.creator || item.author,
            guid: item.guid || item.link || '',
            categories: item.categories || [],
            imageUrl: cheerio.load(descriptionHtml).root().find('img').first().attr('src'),
          };
        });

        tempProcessedItems.sort((a, b) => new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime());
        
        rawCache = {
          timestamp: now,
          guids: tempProcessedItems.map(item => item.guid),
          items: tempProcessedItems,
        };
        
        await writeCache(RAW_CACHE_FILE, rawCache);
        translatedCache = {}; // Invalidate translated cache
        await writeCache(TRANSLATED_CACHE_FILE, translatedCache);
      } else {
        console.log('No new posts found. Updating raw cache timestamp.');
        rawCache.timestamp = now;
        await writeCache(RAW_CACHE_FILE, rawCache);
      }
    } else {
      // debugInfo.usedRawCache = true;
      // debugInfo.fetchStatus = 'skipped (raw cache fresh)';
    }

    // debugInfo.cacheTimestamp = rawCache.timestamp;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);

    // Step 2: Check for the requested page in the translated cache
    let pageItems: EventItem[];
    if (translatedCache[page]) {
      console.log(`Using translated cache for page ${page}.`);
      // debugInfo.usedTranslatedCache = true;
      pageItems = translatedCache[page].items;
    } else {
      console.log(`No translated cache for page ${page}. Translating on demand...`);
      // debugInfo.usedTranslatedCache = false;
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const itemsToTranslate = rawCache.items.slice(startIndex, endIndex);

      pageItems = [];
      for (const item of itemsToTranslate) {
        const translatedTitle = await translateText(item.title ?? '', { translationApiCallCount: 0 });
        const translatedDescription = await translateAndSanitizeHTML(item.originalDescription ?? '', { translationApiCallCount: 0 });
        pageItems.push({ ...item, title: translatedTitle, description: translatedDescription });
      }

      translatedCache[page] = { timestamp: now, items: pageItems };
      await writeCache(TRANSLATED_CACHE_FILE, translatedCache);
    }

    const totalItems = Math.min(rawCache.items.length, MAX_CACHED_ITEMS);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return NextResponse.json({
      items: pageItems,
      totalItems: totalItems,
      itemsPerPage: ITEMS_PER_PAGE,
      totalPages: totalPages,
      currentPage: page,
      // debug: debugInfo,
    });

  } catch (error) {
    console.error('RSS fetch or processing error:', error);
    // debugInfo.fetchStatus = 'fail';
    // debugInfo.errorDetails = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch or process RSS feed', details: error instanceof Error ? error.message : 'Unknown error' /*, debug: debugInfo */ },
      { status: 500 }
    );
  }
}
