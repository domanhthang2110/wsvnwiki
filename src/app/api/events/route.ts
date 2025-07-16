import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EventItem } from '@/types/events'; // Assuming EventItem is still needed for response type

// --- Constants ---
const ITEMS_PER_PAGE = 10;

// --- Main GET Function ---
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const supabase = await createClient();

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE - 1; // Supabase range is inclusive

    // Fetch paginated events from Supabase
    const { data: events, count, error } = await supabase
      .from('events')
      .select('*', { count: 'exact' })
      .order('pub_date', { ascending: false }) // Order by newest first
      .range(startIndex, endIndex);

    if (error) {
      console.error('Error fetching events from Supabase:', error);
      throw new Error(error.message);
    }

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    // Map Supabase data to EventItem type if necessary (assuming direct compatibility)
    const pageItems: EventItem[] = events.map(event => ({
      title: event.title || 'No Title',
      link: event.link || '',
      description: event.description || '',
      originalDescription: event.description || '', // Assuming description from DB is already translated/processed
      pubDate: event.pub_date || new Date().toISOString(),
      author: event.author || '',
      guid: event.guid,
      categories: [], // Categories are not stored in DB in this schema, adjust if needed
      imageUrl: event.image_url || '',
    }));

    return NextResponse.json({
      items: pageItems,
      totalItems: totalItems,
      itemsPerPage: ITEMS_PER_PAGE,
      totalPages: totalPages,
      currentPage: page,
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
