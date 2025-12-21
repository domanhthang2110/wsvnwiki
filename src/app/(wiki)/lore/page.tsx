'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import classContentStyles from '@/components/features/wiki/classes/ClassContent.module.css';
import wsrvLoader from '@/lib/utils/imageLoader';

interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  faction?: 'Sentinel' | 'Legion' | 'Neutral';
  image?: string;
  type: 'major' | 'battle' | 'discovery' | 'founding';
  content: string;
}

const timelineEvents: TimelineEvent[] = [
  {
    id: '1',
    year: 'Age of Creation',
    title: 'The First Awakening',
    description: 'The ancient gods forge the world of Arinar, breathing life into the first races.',
    faction: 'Neutral',
    image: '/image/ui/big_logo.webp',
    type: 'major',
    content: 'In the primordial darkness, the ancient gods gathered their divine essence to create Arinar. The Firstborn emerged from the sacred groves, blessed with eternal wisdom and connection to nature. The Chosen were granted divine favor, becoming the guardians of holy light. From the mountain peaks came the Mountain Clan, hardy and resilient. And from the shadows, the Forsaken rose, masters of dark arts and forbidden knowledge.'
  },
  {
    id: '2',
    year: '1st Era',
    title: 'The Great Schism',
    description: 'Ideological differences split the races into two opposing factions: Sentinel and Legion.',
    faction: 'Neutral',
    image: '/image/faction_split.webp',
    type: 'major',
    content: 'As the races grew in power and influence, fundamental disagreements about the future of Arinar emerged. The Chosen and Firstborn, believing in order, justice, and protection of the innocent, formed the Sentinel alliance. Meanwhile, the Mountain Clan and Forsaken, valuing strength, freedom, and the right to forge one\'s own destiny, united under the Legion banner. This division would shape the fate of Arinar for millennia to come.'
  },
  {
    id: '3',
    year: '2nd Era',
    title: 'Battle of Crimson Fields',
    description: 'The first major conflict between Sentinel and Legion forces claims thousands of lives.',
    faction: 'Neutral',
    image: '/image/factions/elf_badge.webp',
    type: 'battle',
    content: 'The fertile plains of what would become known as the Crimson Fields witnessed the first large-scale battle between the newly formed factions. Sentinel forces, led by Chosen Paladins and Firstborn Rangers, clashed with Legion armies of Mountain Clan Barbarians and Forsaken Death Knights. The battle raged for seven days and nights, turning the green fields red with blood. Though neither side achieved decisive victory, the conflict established the eternal struggle that defines Arinar.'
  },
  {
    id: '4',
    year: '3rd Era',
    title: 'Discovery of the Ancient Relics',
    description: 'Powerful artifacts from the Age of Creation are unearthed, shifting the balance of power.',
    faction: 'Neutral',
    image: '/image/talents/key_talent.webp',
    type: 'discovery',
    content: 'Deep within forgotten ruins, explorers from both factions discovered ancient relics imbued with primordial magic. These artifacts granted incredible powers to those who could master them, leading to the development of advanced combat techniques and magical abilities. The discovery sparked a new arms race as both Sentinel and Legion sought to claim these powerful items, leading to countless expeditions into dangerous territories.'
  },
  {
    id: '5',
    year: '4th Era',
    title: 'Founding of the Great Cities',
    description: 'Major settlements are established, becoming centers of faction power and culture.',
    faction: 'Neutral',
    image: '/image/ui/cloud/cloud.webp',
    type: 'founding',
    content: 'As the factions solidified their territories, great cities rose from the wilderness. The Sentinel established gleaming bastions of light and order, with towering spires and sacred temples. The Legion built formidable fortresses carved from mountain stone and wreathed in shadow. These cities became not just military strongholds, but centers of learning, culture, and the unique philosophies that drive each faction.'
  },
  {
    id: '6',
    year: '5th Era',
    title: 'The Eternal War Begins',
    description: 'Formal declaration of eternal conflict as both factions claim rightful dominion over Arinar.',
    faction: 'Neutral',
    image: '/image/factions/mc_badge.webp',
    type: 'major',
    content: 'After centuries of skirmishes and uneasy truces, both factions formally declared their intent to claim dominion over all of Arinar. The Sentinel proclaimed their divine mandate to bring order and justice to the world, while the Legion asserted their right to freedom and strength. Thus began the Eternal War - not a single conflict, but an ongoing struggle that continues to this day, with heroes from both sides rising to defend their beliefs and way of life.'
  }
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'major': return '⭐';
    case 'battle': return '⚔️';
    case 'discovery': return '🔍';
    case 'founding': return '🏰';
    default: return '📜';
  }
};

const TimelineCard = ({ event, index }: { event: TimelineEvent, index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLeft = index % 2 === 0;

  return (
    <div className={`relative flex flex-col md:flex-row w-full mb-12 md:mb-24 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
      {/* Central Timeline Point (Desktop) */}
      <div className="hidden md:flex absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 justify-center">
        <div className="absolute top-8 w-10 h-10 rounded-full border-4 border-[#e6ce63] bg-gray-950 flex items-center justify-center z-20 shadow-[0_0_20px_rgba(230,206,99,0.5)] transition-all duration-300 group-hover:scale-110">
          <span className="text-lg">{getTypeIcon(event.type)}</span>
        </div>
      </div>

      {/* Spacing for the other side on desktop */}
      <div className="hidden md:block w-1/2" />

      {/* Content Container */}
      <div className={`w-full md:w-1/2 px-4 md:px-12 relative ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
        {/* Mobile Dot (Hidden on Desktop) */}
        <div className="md:hidden absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 border-[#e6ce63] bg-gray-950 flex items-center justify-center z-10 shadow-[0_0_10px_rgba(230,206,99,0.3)]">
          <span className="text-[10px]">{getTypeIcon(event.type)}</span>
        </div>

        {/* The Card */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className={`group relative p-[1px] rounded-lg transition-all duration-500 cursor-pointer overflow-hidden
            ${isExpanded ? 'scale-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'scale-[0.98] hover:scale-100 shadow-xl shadow-black/20'}
          `}
        >
          {/* Animated Gold Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#e6ce63] via-[#a18a2d] to-[#e6ce63] opacity-50 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Internal Card Content */}
          <div className="relative bg-[#0b0f16] p-6 rounded-[7px] h-full flex flex-col gap-4">
            {/* Header Content */}
            <div className={`flex flex-col ${isLeft ? 'md:items-end' : 'md:items-start'}`}>
              <span className="text-[#e6ce63] font-serif text-sm tracking-[0.2em] uppercase mb-1">
                {event.year}
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2 group-hover:text-[#e6ce63] transition-colors duration-300" style={{ fontFamily: "'Cinzel', serif" }}>
                {event.title}
              </h3>
              <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-[#e6ce63]/50 to-transparent" />
            </div>

            {/* Description (Preview) */}
            <p className={`text-gray-400 text-sm md:text-base leading-relaxed transition-all duration-500 ${isExpanded ? 'opacity-0 h-0 hidden' : 'opacity-100'}`}>
              {event.description}
            </p>

            {/* Expanded Content View */}
            <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {event.image && (
                <div className="relative w-full aspect-video mb-6 rounded-lg overflow-hidden border-2 border-[#e6ce63]/20 group-hover:border-[#e6ce63]/40 transition-colors">
                  <Image
                    loader={wsrvLoader}
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 600px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}

              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-[#e6ce63]/20 rounded-full" />
                <p className="pl-6 text-gray-200 text-lg italic leading-relaxed font-light">
                  &ldquo;{event.content}&rdquo;
                </p>
              </div>

              {event.faction && event.faction !== 'Neutral' && (
                <div className={`mt-8 flex items-center gap-4 p-4 rounded-lg border-l-4 ${event.faction === 'Sentinel'
                    ? 'bg-blue-900/10 border-blue-500/50'
                    : 'bg-red-900/10 border-red-500/50'
                  }`}>
                  <Image
                    loader={wsrvLoader}
                    src={event.faction === 'Sentinel' ? '/image/factions/elf_badge.webp' : '/image/factions/mc_badge.webp'}
                    alt={event.faction}
                    width={32}
                    height={32}
                    className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                  />
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#e6ce63] block mb-0.5">Historical Record</span>
                    <span className="text-white font-bold">{event.faction} Involvement</span>
                  </div>
                </div>
              )}
            </div>

            {/* Toggle Indicator */}
            <div className={`mt-2 flex items-center justify-center text-[#e6ce63] transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
              <span className="text-xs tracking-widest uppercase font-bold mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {isExpanded ? 'Consolidate' : 'Explore'}
              </span>
              <span className="text-2xl animate-bounce-slow">▼</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LorePage() {
  return (
    <div className={`${classContentStyles.pixelBackground} min-h-screen relative overflow-x-hidden pb-32`}>
      {/* Google Fonts Injection */}
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Inter:wght@300;400;700&display=swap" rel="stylesheet" />

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/parchment.png')] mix-blend-overlay" />
      <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10" />

      {/* Hero Header */}
      <div className="relative z-20 max-w-6xl mx-auto px-6 pt-24 pb-16 md:pt-40 md:pb-32 text-center">
        <div className="inline-block relative">
          <div className="absolute inset-0 blur-3xl bg-[#e6ce63]/20 rounded-full" />
          <h1 className="relative text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#e6ce63] to-[#a18a2d] tracking-[.15em] mb-4" style={{ fontFamily: "'Cinzel', serif" }}>
            LORE
          </h1>
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#e6ce63] to-transparent opacity-50" />
        </div>
        <p className="mt-8 text-gray-400 text-lg md:text-xl font-light tracking-widest uppercase max-w-2xl mx-auto italic">
          The Chronicles of Arinar
        </p>
        <p className="mt-4 text-[#e6ce63]/60 font-serif italic text-sm md:text-base">
          &ldquo;Behold the tapestry of existence, woven from thread of blood and light.&rdquo;
        </p>
      </div>

      {/* Timeline Section */}
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Central Vertical Line (Desktop) */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-gradient-to-b from-[#e6ce63] via-[#a18a2d]/30 to-[#e6ce63] opacity-20" />

        {/* Mobile Sidebar Line */}
        <div className="md:hidden absolute left-[11px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#e6ce63]/50 to-transparent" />

        <div className="flex flex-col w-full">
          {timelineEvents.map((event, index) => (
            <TimelineCard key={event.id} event={event} index={index} />
          ))}
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="mt-20 text-center relative z-20">
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#e6ce63] to-transparent mx-auto mb-8" />
        <p className="text-[#e6ce63] font-serif text-sm tracking-widest uppercase opacity-40 italic">
          More to be unraveled...
        </p>
      </div>

      {/* Animations Helper */}
      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite ease-in-out;
        }
        body {
          background-color: #05070a;
        }
      `}</style>
    </div>
  );
}
