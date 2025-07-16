import { NextRequest, NextResponse } from 'next/server';
import RSSParser from 'rss-parser';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import * as cheerio from 'cheerio';
import { EventItem } from '@/types/events';
import { Translate } from '@google-cloud/translate/build/src/v2';
import { createClient } from '@/lib/supabase/server';

// --- Constants ---
const RSS_URL = 'https://forum.warspear-online.com/index.php?/forum/23-news-announcements.xml/';
const MAX_ITEMS_TO_PROCESS = 20; // Limit the number of items to process from the RSS feed

// --- Helper Functions ---
function getTranslateClient(): Translate {
  if (!process.env.GOOGLE_CLOUD_API_KEY) {
    throw new Error('GOOGLE_CLOUD_API_KEY is not set in environment variables.');
  }
  return new Translate({ key: process.env.GOOGLE_CLOUD_API_KEY });
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

async function translateText(text: string, targetLanguage: string = 'vi'): Promise<string> {
  if (!text || text.trim() === '') return text;
  try {
    const translate = getTranslateClient();
    const [translation] = await translate.translate(text, targetLanguage);
    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}

async function translateAndSanitizeHTML(htmlContent: string, targetLanguage: string = 'vi'): Promise<string> {
  if (!htmlContent || htmlContent.trim() === '') return htmlContent;
  try {
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

// --- Main GET Function for Cron Job ---
export async function GET(request: NextRequest) {
  // Ensure this route is only accessible via a secure cron job or authenticated request
  // For Vercel Cron Jobs, you might check a secret header or IP whitelist
const authHeader = request.headers.get('Authorization');
const cronSecret = process.env.CRON_SECRET;

if (!authHeader || !cronSecret || !authHeader.startsWith('Bearer ')) {
  return NextResponse.json({ message: 'Unauthorized: Missing or malformed Authorization header' }, { status: 401 });
}

const token = authHeader.split(' ')[1];

if (token !== cronSecret) {
  return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
}

  try {
    const supabase = await createClient({ serviceRole: true }); // Use service role key

    // 1. Fetch RSS feed
    const rawXmlResponse = await fetch(RSS_URL, { cache: 'no-store' }); // Always fetch fresh for cron
    if (!rawXmlResponse.ok) {
      throw new Error(`Failed to fetch raw RSS: ${rawXmlResponse.status}`);
    }
    const rawXmlText = await rawXmlResponse.text();
    const parser = new RSSParser();
    const feed = await parser.parseString(rawXmlText);

    const processedItems: EventItem[] = [];
    for (const item of feed.items.slice(0, MAX_ITEMS_TO_PROCESS)) {
      let descriptionHtml = item.content || item.description || '';
      if (descriptionHtml) {
        const $ = cheerio.load(descriptionHtml);
        $('span[style*="color:#006633"]').css('color', 'white');
        $('span[style*="color:#8e44ad"]').css('color', 'yellow');
        $('span[style*="color:#d35400"]').css('color', 'white');
        descriptionHtml = cleanHtmlContent($.html());
      }

      const translatedTitle = await translateText(item.title ?? '');
      const translatedDescription = await translateAndSanitizeHTML(item.originalDescription ?? '');

      processedItems.push({
        title: translatedTitle,
        link: item.link || '',
        description: translatedDescription,
        originalDescription: item.content || item.description || '', // Keep original for reference if needed
        pubDate: item.pubDate || new Date().toISOString(),
        author: item.creator || item.author,
        guid: item.guid || item.link || '',
        categories: item.categories || [],
        imageUrl: cheerio.load(descriptionHtml).root().find('img').first().attr('src'),
      });
    }

    // Sort by publication date, newest first
    processedItems.sort((a, b) => new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime());

    // 2. Insert/Update into Supabase
    let insertedCount = 0;
    let updatedCount = 0;

    for (const item of processedItems) {
      const { data, error } = await supabase
        .from('events')
        .upsert(
          {
            guid: item.guid,
            title: item.title,
            link: item.link,
            description: item.description,
            pub_date: item.pubDate,
            author: item.author,
            image_url: item.imageUrl,
          },
          { onConflict: 'guid', ignoreDuplicates: false }
        )
        .select();

      if (error) {
        if (error.code === '23505') { // PostgreSQL unique_violation error code
          updatedCount++;
        } else {
          console.error(`Error upserting event ${item.guid}:`, error);
        }
      } else {
        if (data && data.length > 0) {
          const { data: existingEvent } = await supabase
            .from('events')
            .select('id')
            .eq('guid', item.guid)
            .single();
          
          if (existingEvent) {
            updatedCount++;
          } else {
            insertedCount++;
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Events synchronized successfully',
      inserted: insertedCount,
      updated: updatedCount,
      totalProcessed: processedItems.length,
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Failed to synchronize events', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
