import { Item } from '@/types/items';

export function formatFullItemDescription(item: Item): string {
  if (!item.description) {
    return "No description provided.";
  }
  
  let formattedDesc = item.description;
  
  // Add stats information to the description if available
  if (item.stats && Object.keys(item.stats).length > 0) {
    const statsText = Object.entries(item.stats)
      .map(([stat, value]) => `<span style="color: #9dee05">${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${value}</span>`)
      .join(', ');
    formattedDesc += `<br><br><strong>Stats:</strong> ${statsText}`;
  }
  
  // Add level requirement if available
  if (item.level_requirement) {
    formattedDesc += `<br><strong>Level Requirement:</strong> <span style="color: #ffd700">${item.level_requirement}</span>`;
  }
  
  // Add rarity information
  if (item.rarity) {
    const rarityColor = 
      item.rarity === 'legendary' ? '#ff8c00' :
      item.rarity === 'epic' ? '#9932cc' :
      item.rarity === 'rare' ? '#0080ff' :
      item.rarity === 'uncommon' ? '#00ff00' :
      '#808080';
    formattedDesc += `<br><strong>Rarity:</strong> <span style="color: ${rarityColor}">${item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}</span>`;
  }
  
  return formattedDesc;
}