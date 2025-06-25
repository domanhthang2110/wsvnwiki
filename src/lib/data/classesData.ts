export type Faction = 'Chosen' | 'Firstborn' | 'Mountain Clan' | 'Forsaken';
export type Side = 'Sentinel' | 'Legion';
export type ClassName = 'Barbarian' | 'Rogue' | 'Shaman' | 'Hunter' | 'Blade Dancer' | 'Ranger' | 'Druid' | 'Warden' | 'Death Knight' | 'Warlock' | 'Necromancer' | 'Reaper' | 'Paladin' | 'Mage' | 'Priest' | 'Seeker' | 'Chieftain' | 'Templar' | 'Beast Master' | 'Charmer';

export interface ClassInfo {
  name: ClassName;
  faction: Faction;
  side: Side;
}

export const CLASSES_DATA: ClassInfo[] = [
  { name: 'Barbarian', faction: 'Mountain Clan', side: 'Legion' },
  { name: 'Rogue', faction: 'Mountain Clan', side: 'Legion' },
  { name: 'Shaman', faction: 'Mountain Clan', side: 'Legion' },
  { name: 'Hunter', faction: 'Mountain Clan', side: 'Legion' },
  { name: 'Blade Dancer', faction: 'Firstborn', side: 'Sentinel' },
  { name: 'Ranger', faction: 'Firstborn', side: 'Sentinel' },
  { name: 'Druid', faction: 'Firstborn', side: 'Sentinel' },
  { name: 'Warden', faction: 'Firstborn', side: 'Sentinel' },
  { name: 'Death Knight', faction: 'Forsaken', side: 'Legion' },
  { name: 'Warlock', faction: 'Forsaken', side: 'Legion' },
  { name: 'Necromancer', faction: 'Forsaken', side: 'Legion' },
  { name: 'Reaper', faction: 'Forsaken', side: 'Legion' },
  { name: 'Paladin', faction: 'Chosen', side: 'Sentinel' },
  { name: 'Mage', faction: 'Chosen', side: 'Sentinel' },
  { name: 'Priest', faction: 'Chosen', side: 'Sentinel' },
  { name: 'Seeker', faction: 'Chosen', side: 'Sentinel' },
  { name: 'Chieftain', faction: 'Mountain Clan', side: 'Legion' },
  { name: 'Templar', faction: 'Chosen', side: 'Sentinel' },
  { name: 'Beast Master', faction: 'Firstborn', side: 'Sentinel' },
  { name: 'Charmer', faction: 'Forsaken', side: 'Legion' },
];

export const FACTION_ORDER: Faction[] = ['Chosen', 'Firstborn', 'Mountain Clan', 'Forsaken'];
export const SIDE_ORDER: Side[] = ['Sentinel', 'Legion'];
