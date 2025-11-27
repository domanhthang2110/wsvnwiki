'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PostItem, TagRow } from '@/types/posts';
import { GuideCard } from '@/components/features/wiki/guides/GuideCard';
import { InputField } from '@/components/ui/InputField';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Dropdown from '@/components/ui/Dropdown/Dropdown';
import classContentStyles from '@/components/features/wiki/classes/ClassContent.module.css';

// Add custom scrollbar styles
const scrollbarStyles = `
  .scrollbar-thin::-webkit-scrollbar {
    height: 6px;
  }
  .scrollbar-thumb-yellow-400::-webkit-scrollbar-thumb {
    background-color: #facc15;
    border-radius: 3px;
  }
  .scrollbar-track-gray-700::-webkit-scrollbar-track {
    background-color: #374151;
    border-radius: 3px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background-color: #eab308;
  }
`;

const categories = [
  { id: 'all', label: 'Tất cả hướng dẫn', icon: '📚' },
  { id: 'beginner', label: 'Người mới', icon: '🌱' },
  { id: 'combat', label: 'Chiến đấu', icon: '⚔️' },
  { id: 'economy', label: 'Kinh tế', icon: '💰' },
  { id: 'classes', label: 'Lớp nhân vật', icon: '🏰' },
  { id: 'world', label: 'Thế giới', icon: '🌍' }
];

// Category tag mapping for smart filtering
const CATEGORY_TAGS = {
  'beginner': ['nguoi-moi', 'bat-dau', 'co-ban', 'beginner', 'getting-started', 'basics'],
  'combat': ['pvp', 'chien-dau', 'arena', 'guild-wars', 'fighting', 'combat', 'skills'],
  'economy': ['kinh-te', 'thuong-mai', 'vang', 'trading', 'gold', 'market', 'farming', 'economy'],
  'classes': ['lop-nhan-vat', 'mage', 'warrior', 'paladin', 'rogue', 'priest', 'builds', 'classes'],
  'world': ['the-gioi', 'lore', 'dungeons', 'exploration', 'events', 'world', 'quests']
};


interface GuidesClientPageProps {
  initialGuides: PostItem[];
  initialTags: TagRow[];
}

export default function GuidesClientPage({ initialGuides }: GuidesClientPageProps) {
  const [allGuides] = useState<PostItem[]>(initialGuides);
  const [filteredGuides, setFilteredGuides] = useState<PostItem[]>(initialGuides);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('compact');
  const [searchWidth, setSearchWidth] = useState(400);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Helper functions
  const isGuideInCategory = (guide: PostItem, categoryId: string): boolean => {
    if (categoryId === 'all') return true;
    
    const categoryTags = CATEGORY_TAGS[categoryId as keyof typeof CATEGORY_TAGS] || [];
    return guide.tags?.some(tag => 
      categoryTags.includes(tag.slug) || categoryTags.includes(tag.name.toLowerCase())
    ) || false;
  };


  const getFilteredGuides = useCallback((): PostItem[] => {
    let guides = allGuides;
    
    // Filter by category
    if (activeCategory !== 'all') {
      guides = guides.filter(guide => isGuideInCategory(guide, activeCategory));
    }
    
    // Filter by search query
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      guides = guides.filter(guide =>
        guide.title?.toLowerCase().includes(lowerCaseQuery) ||
        guide.content?.toLowerCase().includes(lowerCaseQuery) ||
        guide.tags?.some(tag => tag.name.toLowerCase().includes(lowerCaseQuery))
      );
    }
    
    return guides;
  }, [allGuides, activeCategory, searchQuery]);

  const getCategoryPlaceholder = (): string => {
    switch (activeCategory) {
      case 'beginner': return 'Tìm hướng dẫn cho người mới...';
      case 'combat': return 'Tìm hướng dẫn chiến đấu...';
      case 'economy': return 'Tìm hướng dẫn kinh tế...';
      case 'classes': return 'Tìm hướng dẫn lớp nhân vật...';
      case 'world': return 'Tìm hướng dẫn thế giới...';
      default: return 'Tìm kiếm tất cả hướng dẫn...';
    }
  };

  const getCurrentCategory = () => {
    return categories.find(cat => cat.id === activeCategory) || categories[0];
  };

  useEffect(() => {
    setFilteredGuides(getFilteredGuides());
  }, [searchQuery, activeCategory, allGuides, getFilteredGuides]);

  // Calculate responsive search width
  useEffect(() => {
    const calculateSearchWidth = () => {
      if (searchContainerRef.current) {
        const containerWidth = searchContainerRef.current.offsetWidth;
        // Set width to container width with some padding, minimum 200px, maximum 600px
        const newWidth = Math.max(200, Math.min(600, containerWidth - 20));
        setSearchWidth(newWidth);
      }
    };

    calculateSearchWidth();
    window.addEventListener('resize', calculateSearchWidth);
    return () => window.removeEventListener('resize', calculateSearchWidth);
  }, []);

  return (
    <>
      <style jsx>{scrollbarStyles}</style>
      <div className={`${classContentStyles.pixelBackground} flex flex-col w-full h-full text-white`}>
        
        {/* Fixed Header Section */}
        <div className="flex-shrink-0">

          {/* Navigation & Search Bar */}
          <div className="p-4 shadow-lg border-[3px] border-double border-[#e6ce63]" style={{ backgroundColor: '#3e2e2b' }}>
            {/* Desktop Layout - Horizontal */}
            <div className="hidden md:flex items-center gap-4">
              {/* Category Dropdown */}
              <div className="flex-shrink-0">
                <Dropdown
                  title={
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCurrentCategory().icon}</span>
                      <span>{getCurrentCategory().label}</span>
                    </div>
                  }
                  width="200px"
                  showArrows={true}
                  onPrevious={() => {
                    const currentIndex = categories.findIndex(cat => cat.id === activeCategory);
                    const newIndex = (currentIndex - 1 + categories.length) % categories.length;
                    setActiveCategory(categories[newIndex].id);
                  }}
                  onNext={() => {
                    const currentIndex = categories.findIndex(cat => cat.id === activeCategory);
                    const newIndex = (currentIndex + 1) % categories.length;
                    setActiveCategory(categories[newIndex].id);
                  }}
                >
                  {categories.map((category) => (
                    <a
                      key={category.id}
                      href="#"
                      className={`flex items-center gap-2 w-full text-left ${activeCategory === category.id ? 'selected' : ''}`}
                      onClick={() => setActiveCategory(category.id)}
                    >
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </a>
                  ))}
                </Dropdown>
              </div>

              {/* Search Bar - Responsive width */}
              <div className="flex-grow min-w-0" ref={searchContainerRef}>
                <InputField
                  type="text"
                  placeholder={getCategoryPlaceholder()}
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  width={searchWidth}
                  inputClassName="w-full p-2"
                  className="w-full"
                  leftIcon={
                    <Image
                      src="/image/spyglass.webp"
                      alt="Search"
                      width={20}
                      height={20}
                      className="object-contain"
                      draggable={false}
                    />
                  }
                  iconOffsetLeft={8}
                  textOffsetLeft={32}
                />
              </div>

              {/* View Mode Toggle - Desktop */}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('compact')}
                  className={`px-3 py-2 rounded text-xs font-semibold transition-all ${
                    viewMode === 'compact' ? 'bg-[#e6ce63] text-black' : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                  title="Chế độ thu gọn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 4h18v3H3V4zm0 5h18v3H3V9zm0 5h18v3H3v-3zm0 5h18v3H3v-3z"/>
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`px-3 py-2 rounded text-xs font-semibold transition-all ${
                    viewMode === 'card' ? 'bg-[#e6ce63] text-black' : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                  title="Chế độ thẻ"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="flex flex-col gap-4 md:hidden">
              {/* Mobile Header - Dropdown and Search Toggle */}
              <div className="flex items-center justify-between">
                {/* Category Dropdown - Left aligned */}
                <div className="flex-shrink-0">
                  <Dropdown
                    title={
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCurrentCategory().icon}</span>
                        <span>{getCurrentCategory().label}</span>
                      </div>
                    }
                    width="200px"
                    showArrows={true}
                    onPrevious={() => {
                      const currentIndex = categories.findIndex(cat => cat.id === activeCategory);
                      const newIndex = (currentIndex - 1 + categories.length) % categories.length;
                      setActiveCategory(categories[newIndex].id);
                    }}
                    onNext={() => {
                      const currentIndex = categories.findIndex(cat => cat.id === activeCategory);
                      const newIndex = (currentIndex + 1) % categories.length;
                      setActiveCategory(categories[newIndex].id);
                    }}
                  >
                    {categories.map((category) => (
                      <a
                        key={category.id}
                        href="#"
                        className={`flex items-center gap-2 w-full text-left ${activeCategory === category.id ? 'selected' : ''}`}
                        onClick={() => setActiveCategory(category.id)}
                      >
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                      </a>
                    ))}
                  </Dropdown>
                </div>

                {/* Search Toggle Button - Right aligned */}
                <button
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  className={`px-3 py-2 rounded text-xs font-semibold transition-all ${
                    isSearchExpanded ? 'bg-[#e6ce63] text-black' : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                  title="Tìm kiếm"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                </button>
              </div>

              {/* Expandable Search Bar and Layout Buttons */}
              {isSearchExpanded && (
                <div className="flex items-center gap-3 px-2">
                  {/* Search Bar */}
                  <div className="flex-grow">
                    <InputField
                      type="text"
                      placeholder={getCategoryPlaceholder()}
                      value={searchQuery}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                      width={Math.min(searchWidth, 240)} // Reduced width to make room for buttons
                      inputClassName="w-full p-2"
                      className="w-full"
                      leftIcon={
                        <Image
                          src="/image/spyglass.webp"
                          alt="Search"
                          width={20}
                          height={20}
                          className="object-contain"
                          draggable={false}
                        />
                      }
                      iconOffsetLeft={8}
                      textOffsetLeft={32}
                    />
                  </div>

                  {/* View Mode Toggle - Mobile (Right of search bar) */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setViewMode('compact')}
                      className={`px-3 py-2 rounded text-xs font-semibold transition-all ${
                        viewMode === 'compact' ? 'bg-[#e6ce63] text-black' : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                      title="Chế độ thu gọn"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 4h18v3H3V4zm0 5h18v3H3V9zm0 5h18v3H3v-3zm0 5h18v3H3v-3z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('card')}
                      className={`px-3 py-2 rounded text-xs font-semibold transition-all ${
                        viewMode === 'card' ? 'bg-[#e6ce63] text-black' : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                      title="Chế độ thẻ"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-grow overflow-y-auto" style={{ 
          backgroundImage: 'url("/background.webp")', 
          backgroundRepeat: 'repeat', 
          backgroundSize: '70px 40px', 
          imageRendering: 'pixelated' 
        }}>
          <div className="p-4 border-[3px] border-double border-[#e6ce63] h-full">
            
            {filteredGuides.length > 0 ? (
              <div className={
                viewMode === 'compact'
                  ? 'grid grid-cols-1 lg:grid-cols-2 gap-3'
                  : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              }>
                {filteredGuides.map(guide => (
                  <GuideCard key={guide.id} guide={guide} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-300">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-lg">Không tìm thấy hướng dẫn nào phù hợp với tìm kiếm của bạn.</p>
                <p className="text-sm mt-2">Thử điều chỉnh từ khóa tìm kiếm hoặc duyệt danh mục khác.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
