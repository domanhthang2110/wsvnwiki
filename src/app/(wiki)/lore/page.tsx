'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import classContentStyles from '@/components/features/wiki/classes/ClassContent.module.css';

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

export default function LorePage() {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const getFactionColor = (faction?: string) => {
    switch (faction) {
      case 'Sentinel': return 'border-blue-400 bg-blue-900/20';
      case 'Legion': return 'border-red-400 bg-red-900/20';
      default: return 'border-yellow-400 bg-yellow-900/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'major': return '⭐';
      case 'battle': return '⚔️';
      case 'discovery': return '🔍';
      case 'founding': return '🏰';
      default: return '📜';
    }
  };

  return (
    <div className={`${classContentStyles.pixelBackground} flex h-screen overflow-hidden`}>
      {/* Timeline Section */}
      <div className={`transition-all duration-500 ease-in-out overflow-y-auto ${selectedEvent ? 'w-0 md:w-2/5' : 'w-full'}`}>
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-[#e6ce63] via-[#d4af37] to-[#e6ce63]"></div>
              
              {timelineEvents.map((event, index) => (
                <div key={event.id} className="relative mb-8 ml-16">
                  {/* Timeline dot */}
                  <div className={`absolute top-4 w-10 h-10 rounded-full border-4 ${getFactionColor(event.faction)} flex items-center justify-center text-lg z-10`} style={{ left: '-40px', backgroundColor: '#1f2937' }}>
                    {getTypeIcon(event.type)}
                  </div>
                  
                  {/* Event card */}
                  <div 
                    className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${getFactionColor(event.faction)} ${selectedEvent?.id === event.id ? 'ring-2 ring-[#e6ce63]' : ''}`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start gap-4">
                      {event.image && (
                        <div className="flex-shrink-0">
                          <Image 
                            src={event.image} 
                            alt={event.title}
                            width={64}
                            height={64}
                            className="rounded-lg border border-[#e6ce63]"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="text-sm text-[#e6ce63] font-semibold mb-1">
                          {event.year}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {event.title}
                        </h3>
                        <p className="text-gray-300">
                          {event.description}
                        </p>
                        {event.faction && event.faction !== 'Neutral' && (
                          <div className="mt-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              event.faction === 'Sentinel' ? 'bg-blue-900 text-blue-200' : 'bg-red-900 text-red-200'
                            }`}>
                              <Image 
                                src={event.faction === 'Sentinel' ? '/image/factions/elf_badge.webp' : '/image/factions/mc_badge.webp'}
                                alt={event.faction}
                                width={16}
                                height={16}
                                className="mr-2"
                              />
                              {event.faction}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Panel - Slides in from right */}
      <div className={`transition-all duration-500 ease-in-out overflow-y-auto border-l-2 border-[#e6ce63] bg-gray-900/80 backdrop-blur-sm ${selectedEvent ? 'w-full md:w-3/5 translate-x-0' : 'w-0 translate-x-full'}`}>
        {selectedEvent && (
          <div className="p-8">
            {/* Close button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <span>✕</span>
                <span>Close</span>
              </button>
            </div>

            {/* Content */}
            <div className={`rounded-lg border-2 ${getFactionColor(selectedEvent.faction)} p-6`}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{getTypeIcon(selectedEvent.type)}</span>
                <div>
                  <div className="text-sm text-[#e6ce63] font-semibold">
                    {selectedEvent.year}
                  </div>
                  <h1 className="text-3xl font-bold text-white">
                    {selectedEvent.title}
                  </h1>
                </div>
              </div>
              
              {selectedEvent.image && (
                <div className="mb-6">
                  <Image 
                    src={selectedEvent.image} 
                    alt={selectedEvent.title}
                    width={600}
                    height={300}
                    className="w-full rounded-lg border border-[#e6ce63]"
                  />
                </div>
              )}
              
              <div className="text-gray-300 leading-relaxed text-lg mb-6">
                {selectedEvent.content}
              </div>
              
              {selectedEvent.faction && selectedEvent.faction !== 'Neutral' && (
                <div className="pt-6 border-t border-gray-600">
                  <div className="flex items-center gap-3">
                    <Image 
                      src={selectedEvent.faction === 'Sentinel' ? '/image/factions/elf_badge.webp' : '/image/factions/mc_badge.webp'}
                      alt={selectedEvent.faction}
                      width={32}
                      height={32}
                    />
                    <span className="text-[#e6ce63] font-semibold text-lg">
                      {selectedEvent.faction} Involvement
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
