export type Faction = 'Chosen' | 'Firstborn' | 'Mountain Clan' | 'Forsaken';
export type Side = 'Sentinel' | 'Legion';
export type ClassName = 'Barbarian' | 'Rogue' | 'Shaman' | 'Hunter' | 'Blade Dancer' | 'Ranger' | 'Druid' | 'Warden' | 'Death Knight' | 'Warlock' | 'Necromancer' | 'Reaper' | 'Paladin' | 'Mage' | 'Priest' | 'Seeker' | 'Chieftain' | 'Templar' | 'Beast Master' | 'Charmer';

export interface ClassInfo {
  name: ClassName;
  faction: Faction;
  side: Side;
  faction_icon: string;
  banner?: string;
}

export const CLASSES_DATA: ClassInfo[] = [
  { name: 'Barbarian', faction: 'Mountain Clan', side: 'Legion', faction_icon: '/image/factions/mountain-clan/icon.webp' },
  { name: 'Rogue', faction: 'Mountain Clan', side: 'Legion', faction_icon: '/image/factions/mountain-clan/icon.webp' },
  { name: 'Shaman', faction: 'Mountain Clan', side: 'Legion', faction_icon: '/image/factions/mountain-clan/icon.webp' },
  { name: 'Hunter', faction: 'Mountain Clan', side: 'Legion', faction_icon: '/image/factions/mountain-clan/icon.webp' },
  { name: 'Blade Dancer', faction: 'Firstborn', side: 'Sentinel', faction_icon: '/image/factions/firstborn/icon.webp' },
  { name: 'Ranger', faction: 'Firstborn', side: 'Sentinel', faction_icon: '/image/factions/firstborn/icon.webp' },
  { name: 'Druid', faction: 'Firstborn', side: 'Sentinel', faction_icon: '/image/factions/firstborn/icon.webp' },
  { name: 'Warden', faction: 'Firstborn', side: 'Sentinel', faction_icon: '/image/factions/firstborn/icon.webp' },
  { name: 'Death Knight', faction: 'Forsaken', side: 'Legion', faction_icon: '/image/factions/forsaken/icon.webp' },
  { name: 'Warlock', faction: 'Forsaken', side: 'Legion', faction_icon: '/image/factions/forsaken/icon.webp' },
  { name: 'Necromancer', faction: 'Forsaken', side: 'Legion', faction_icon: '/image/factions/forsaken/icon.webp' },
  { name: 'Reaper', faction: 'Forsaken', side: 'Legion', faction_icon: '/image/factions/forsaken/icon.webp' },
  { name: 'Paladin', faction: 'Chosen', side: 'Sentinel', faction_icon: '/image/factions/chosen/icon.webp' },
  { name: 'Mage', faction: 'Chosen', side: 'Sentinel', faction_icon: '/image/factions/chosen/icon.webp', banner: '/image/classes/mage/banner.gif' },
  { name: 'Priest', faction: 'Chosen', side: 'Sentinel', faction_icon: '/image/factions/chosen/icon.webp' },
  { name: 'Seeker', faction: 'Chosen', side: 'Sentinel', faction_icon: '/image/factions/chosen/icon.webp' },
  { name: 'Chieftain', faction: 'Mountain Clan', side: 'Legion', faction_icon: '/image/factions/mountain-clan/icon.webp' },
  { name: 'Templar', faction: 'Chosen', side: 'Sentinel', faction_icon: '/image/factions/chosen/icon.webp' },
  { name: 'Beast Master', faction: 'Firstborn', side: 'Sentinel', faction_icon: '/image/factions/firstborn/icon.webp' },
  { name: 'Charmer', faction: 'Forsaken', side: 'Legion', faction_icon: '/image/factions/forsaken/icon.webp' },
];

export const FACTION_ORDER: Faction[] = ['Chosen', 'Firstborn', 'Mountain Clan', 'Forsaken'];
export const SIDE_ORDER: Side[] = ['Sentinel', 'Legion'];
