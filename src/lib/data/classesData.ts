export type Faction = 'Chosen' | 'Firstborn' | 'Mountain Clan' | 'Forsaken';
export type Side = 'Sentinel' | 'Legion';
export type ClassName = 'Barbarian' | 'Rogue' | 'Shaman' | 'Hunter' | 'Blade Dancer' | 'Ranger' | 'Druid' | 'Warden' | 'Death Knight' | 'Warlock' | 'Necromancer' | 'Reaper' | 'Paladin' | 'Mage' | 'Priest' | 'Seeker' | 'Chieftain' | 'Templar' | 'Beast Master' | 'Charmer';

export interface ClassInfo {
  name: ClassName;
  slug: string;
  faction: Faction;
  side: Side;
  faction_icon: string;
  banner?: string;
}

export const CLASSES_DATA: ClassInfo[] = [
  { name: 'Barbarian', slug: 'barbarian', faction: 'Mountain Clan', side: 'Legion', faction_icon: '/image/factions/mountain-clan/icon.webp' },
  { name: 'Rogue', slug: 'rogue', faction: 'Mountain Clan', side: 'Legion', faction_icon: '/image/factions/mountain-clan/icon.webp' },
  { name: 'Shaman', slug: 'shaman', faction: 'Mountain Clan', side: 'Legion', faction_icon: '/image/factions/mountain-clan/icon.webp' },
  { name: 'Hunter', slug: 'hunter', faction: 'Mountain Clan', side: 'Legion', faction_icon: '/image/factions/mountain-clan/icon.webp' },
  { name: 'Blade Dancer', slug: 'blade-dancer', faction: 'Firstborn', side: 'Sentinel', faction_icon: '/image/factions/firstborn/icon.webp' },
  { name: 'Ranger', slug: 'ranger', faction: 'Firstborn', side: 'Sentinel', faction_icon: '/image/factions/firstborn/icon.webp' },
  { name: 'Druid', slug: 'druid', faction: 'Firstborn', side: 'Sentinel', faction_icon: '/image/factions/firstborn/icon.webp' },
  { name: 'Warden', slug: 'warden', faction: 'Firstborn', side: 'Sentinel', faction_icon: '/image/factions/firstborn/icon.webp' },
  { name: 'Death Knight', slug: 'death-knight', faction: 'Forsaken', side: 'Legion', faction_icon: '/image/factions/forsaken/icon.webp' },
  { name: 'Warlock', slug: 'warlock', faction: 'Forsaken', side: 'Legion', faction_icon: '/image/factions/forsaken/icon.webp' },
  { name: 'Necromancer', slug: 'necromancer', faction: 'Forsaken', side: 'Legion', faction_icon: '/image/factions/forsaken/icon.webp' },
  { name: 'Reaper', slug: 'reaper', faction: 'Forsaken', side: 'Legion', faction_icon: '/image/factions/forsaken/icon.webp' },
  { name: 'Paladin', slug: 'paladin', faction: 'Chosen', side: 'Sentinel', faction_icon: '/image/factions/chosen/icon.webp' },
  { name: 'Mage', slug: 'mage', faction: 'Chosen', side: 'Sentinel', faction_icon: '/image/factions/chosen/icon.webp', banner: '/image/classes/mage/banner.gif' },
  { name: 'Priest', slug: 'priest', faction: 'Chosen', side: 'Sentinel', faction_icon: '/image/factions/chosen/icon.webp' },
  { name: 'Seeker', slug: 'seeker', faction: 'Chosen', side: 'Sentinel', faction_icon: '/image/factions/chosen/icon.webp' },
  { name: 'Chieftain', slug: 'chieftain', faction: 'Mountain Clan', side: 'Legion', faction_icon: '/image/factions/mountain-clan/icon.webp' },
  { name: 'Templar', slug: 'templar', faction: 'Chosen', side: 'Sentinel', faction_icon: '/image/factions/chosen/icon.webp' },
  { name: 'Beast Master', slug: 'beast-master', faction: 'Firstborn', side: 'Sentinel', faction_icon: '/image/factions/firstborn/icon.webp' },
  { name: 'Charmer', slug: 'charmer', faction: 'Forsaken', side: 'Legion', faction_icon: '/image/factions/forsaken/icon.webp' },
];

export const FACTION_ORDER: Faction[] = ['Chosen', 'Firstborn', 'Mountain Clan', 'Forsaken'];
export const SIDE_ORDER: Side[] = ['Sentinel', 'Legion'];
