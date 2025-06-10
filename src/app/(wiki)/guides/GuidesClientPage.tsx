'use client';

import { useState, useEffect, useMemo } from 'react';
import { PostItem, TagRow } from '@/types/posts';
import { GuideCard } from '@/components/features/wiki/guides/GuideCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button/button';

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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Guides</h1>
      <p className="text-lg text-muted-foreground mb-8 text-center">
        Browse guides and tutorials to improve your gameplay.
      </p>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Search Bar */}
        <div className="flex-grow">
          <Input
            type="text"
            placeholder="Search guides..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Tag Filter */}
        <div className="md:w-1/3 lg:w-1/4 bg-card p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-3">Filter by Tags</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Button
                key={tag.id}
                variant={selectedTagIds.has(tag.id) ? "default" : "outline"}
                size="sm"
                onClick={() => handleTagToggle(tag.id)}
                className="rounded-full"
              >
                {tag.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Guide Cards */}
      {filteredGuides.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map(guide => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-10">
          No guides found matching your criteria.
        </div>
      )}
    </div>
  );
}
