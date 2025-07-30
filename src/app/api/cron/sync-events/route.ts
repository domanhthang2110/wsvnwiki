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
    console.log("--- Before Sanitization ---");
    console.log(htmlContent);
    const { window } = new JSDOM('');
    const purify = DOMPurify(window);
    const sanitizedHtml = purify.sanitize(htmlContent, { USE_PROFILES: { html: true } });
    console.log("--- After Sanitization, Before Translation ---");
    console.log(sanitizedHtml);
    const translate = getTranslateClient();
    const [translation] = await translate.translate(sanitizedHtml, targetLanguage);
    console.log("--- After Translation ---");
    console.log(translation);
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

    // Fetch existing guids to avoid re-translating already processed events
    const { data: existingGuidsData, error: existingGuidsError } = await supabase
      .from('events')
      .select('guid');

    if (existingGuidsError) {
      console.error('Error fetching existing guids:', existingGuidsError);
      // If fetching existing guids fails, we proceed but might re-translate existing items.
      // This is a fallback to ensure the cron job doesn't completely fail.
    }
    const existingGuids = new Set(existingGuidsData?.map(row => row.guid) || []);

    // 1. Fetch RSS feed
    const rawXmlResponse = await fetch(RSS_URL, { cache: 'no-store' }); // Always fetch fresh for cron
    if (!rawXmlResponse.ok) {
      throw new Error(`Failed to fetch raw RSS: ${rawXmlResponse.status}`);
    }
    const rawXmlText = await rawXmlResponse.text();
    const parser = new RSSParser();
    const feed = await parser.parseString(rawXmlText);

    let insertedCount = 0;
    let skippedCount = 0; // Renamed from updatedCount to better reflect "skipped translation"

    for (const item of feed.items.slice(0, MAX_ITEMS_TO_PROCESS)) {
      // Check if the event already exists in the database by its GUID
      if (existingGuids.has(item.guid)) {
        skippedCount++; // Count as skipped since it was already present and translated
        continue; // Skip translation and insertion for existing items
      }

      // Only process and translate new items
      let descriptionHtml = item.content || item.description || '';
      console.log(`--- Initial descriptionHtml for ${item.guid} ---`);
      console.log(descriptionHtml);
      if (descriptionHtml) {
        const $ = cheerio.load(descriptionHtml);
        $('span[style*="color:#006633"]').css('color', 'white');
        $('span[style*="color:#8e44ad"]').css('color', 'yellow');
        $('span[style*="color:#d35400"]').css('color', 'white');
        descriptionHtml = cleanHtmlContent($.html());
        console.log(`--- After cleanHtmlContent for ${item.guid} ---`);
        console.log(descriptionHtml);
      }

      const translatedTitle = await translateText(item.title ?? '');
      const translatedDescription = await translateAndSanitizeHTML(descriptionHtml);

      // 2. Insert into Supabase (only new items reach here)
      const { data, error } = await supabase
        .from('events')
        .insert(
          {
            guid: item.guid,
            title: translatedTitle, // Use translated content
            link: item.link,
            description: translatedDescription, // Use translated content
            pub_date: item.pubDate,
            author: item.author,
            image_url: cheerio.load(descriptionHtml).root().find('img').first().attr('src'), // Image URL from processed HTML
          }
        )
        .select();

      if (error) {
        console.error(`Error inserting new event ${item.guid}:`, error);
      } else {
        if (data && data.length > 0) {
          insertedCount++;
        }
      }
    }

    return NextResponse.json({
      message: 'Events synchronized successfully',
      inserted: insertedCount,
      skippedExisting: skippedCount, // Reflects items that were already in the DB and thus skipped translation
      totalProcessedFromFeed: feed.items.slice(0, MAX_ITEMS_TO_PROCESS).length, // Total items from RSS feed considered
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Failed to synchronize events', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
