import { Item } from '@/types/items';

export function formatFullItemDescription(item: Item): string {
  if (!item.description) {
    return "No description provided.";
  }

  return item.description;
}