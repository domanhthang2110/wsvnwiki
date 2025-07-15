'use client';

import { useState, useEffect} from 'react';
import { PostItem, TagRow } from '@/types/posts';
import { GuideCard } from '@/components/features/wiki/guides/GuideCard';
import { InputField } from '@/components/ui/InputField';
import Image from 'next/image';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import LongButton from '@/components/ui/LongButton'; // Import LongButton
import classContentStyles from '@/components/features/wiki/classes/ClassContent.module.css'; // Reusing the pixel background style

interface GuidesClientPageProps {
  initialGuides: PostItem[];
  initialTags: TagRow[];
}

export default function GuidesClientPage({ initialGuides, initialTags }: GuidesClientPageProps) {
  const [allGuides] = useState<PostItem[]>(initialGuides);
  const [filteredGuides, setFilteredGuides] = useState<PostItem[]>(initialGuides);
  const [allTags] = useState<TagRow[]>(initialTags);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false); // New state for compact view

  useEffect(() => {
    let currentFilteredGuides = allGuides;

    // Filter by search query
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      currentFilteredGuides = currentFilteredGuides.filter(guide =>
        guide.title?.toLowerCase().includes(lowerCaseQuery)
      );
    }

    // Filter by selected tags
    if (selectedTagIds.size > 0) {
      currentFilteredGuides = currentFilteredGuides.filter(guide =>
        guide.tags?.some(tag => selectedTagIds.has(tag.id))
      );
    }

    setFilteredGuides(currentFilteredGuides);
  }, [searchQuery, selectedTagIds, allGuides]);

  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tagId)) {
        newSet.delete(tagId);
      } else {
        newSet.add(tagId);
      }
      return newSet;
    });
  };

  return (
    <div className={`${classContentStyles.pixelBackground} flex flex-col w-full h-full p-4 border-[3px] border-double border-[#e6ce63] shadow-lg text-white`}>

      <div className="flex flex-col gap-6 mb-8 p-4 shadow-lg mx-[-16px] mt-[-16px] border-[3px] border-double border-[#e6ce63]" style={{ backgroundColor: '#3e2e2b' }}>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Search Bar */}
          <div className="flex-grow flex items-center gap-4">
            <InputField
              type="text"
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              width={300}
              inputClassName="w-full p-2"
              className="w-full"
              leftIcon={
                <Image
                  src="/image/spyglass.webp"
                  alt="Search"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              }
              iconOffsetLeft={8}
              textOffsetLeft={32}
            />
            <LongButton
              onClick={() => setShowTagFilter(prev => !prev)}
              className="flex-shrink-0"
              width={120}
            >
              {"Lọc"}
            </LongButton>
          </div>
          <LongButton
            onClick={() => setIsCompactView(prev => !prev)}
            className="flex-shrink-0"
            width={120}
          >
            {isCompactView ? "Compact View" : "Normal View"}
          </LongButton>
        </div>

        {/* Tag Filter */}
        {showTagFilter && (
          <div className="p-4 rounded-lg shadow-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
            <h3 className="font-semibold mb-3 text-white">Lọc theo tag</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Checkbox
                  key={tag.id}
                  isChecked={selectedTagIds.has(tag.id)}
                  onClick={() => handleTagToggle(tag.id)}
                  label={tag.name}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Guide Cards */}
      {filteredGuides.length > 0 ? (
        <div className={`grid ${isCompactView ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>
          {filteredGuides.map(guide => (
            <GuideCard key={guide.id} guide={guide} isCompact={isCompactView} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-white">
          Không tìm thấy bài viết nào phù hợp với tiêu chí tìm kiếm của bạn.
        </div>
      )}
    </div>
  );
}
