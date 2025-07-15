export interface EventItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  author?: string;
  guid: string;
  categories?: string[];
  imageUrl?: string; // Added for cover image
  originalDescription?: string; // Added for language toggle
}

export interface EventFeed {
  title: string;
  description: string;
  link: string;
  items: EventItem[];
}
