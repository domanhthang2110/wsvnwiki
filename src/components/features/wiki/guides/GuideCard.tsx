import Image from 'next/image';
import { PostItem } from '@/types/posts';
import { LoadingLink } from '@/components/shared/LoadingLink';

interface GuideCardProps {
  guide: PostItem;
  isCompact?: boolean; // Keep for backward compatibility
  isEssential?: boolean;
  viewMode?: 'card' | 'compact';
}

export function GuideCard({ guide, isCompact = false, isEssential = false, viewMode = 'card' }: GuideCardProps) {
  const truncateContent = (content: string | null | undefined, maxLength: number) => {
    if (!content) return '';
    const strippedContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    if (strippedContent.length <= maxLength) return strippedContent;
    return strippedContent.substring(0, maxLength) + '...';
  };

  const contentPreview = truncateContent(guide.content, 150);

  // Use isCompact for backward compatibility, but prefer viewMode
  const actualViewMode = viewMode || (isCompact ? 'compact' : 'card');

  // Compact Card View
  if (actualViewMode === 'compact') {
    return (
      <LoadingLink href={`/guides/${guide.slug}`}>
        <div className={`relative bg-gray-800 overflow-hidden cursor-pointer hover:bg-gray-700 transition-all duration-200 flex flex-row items-center p-3 min-h-[80px] ${
          isEssential ? 'border-[2px] border-yellow-400' : 'border-[2px] border-[#e6ce63]'
        }`}>
          {guide.featured_image_url && (
            <div className="relative w-16 h-16 flex-shrink-0 mr-3">
              <Image
                src={guide.featured_image_url}
                alt={guide.title || 'Guide featured image'}
                fill
                style={{ objectFit: 'cover' }}
                className="rounded"
                draggable={false}
              />
            </div>
          )}
          <div className="flex-grow text-white">
            <div className="flex items-center gap-2 mb-1">
              {isEssential && (
                <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded font-bold">⭐ Thiết yếu</span>
              )}
            </div>
            <h3 className="font-bold text-sm line-clamp-1 mb-1">{guide.title}</h3>
            <p className="text-xs text-gray-300 line-clamp-2">{contentPreview}</p>
          </div>
        </div>
      </LoadingLink>
    );
  }


  // Original Card View
  return (
    <LoadingLink href={`/guides/${guide.slug}`}>
      <div
        className={`relative bg-gray-800 overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 flex flex-col ${
          isEssential ? 'min-h-[240px] border-[3px] border-yellow-400' : 'min-h-[200px] border-[2px] border-[#e6ce63]'
        }`}
      >
        {guide.featured_image_url && (
          <div className={`relative w-full flex-shrink-0 ${isEssential ? 'h-32' : 'h-28'}`}>
            <Image
              src={guide.featured_image_url}
              alt={guide.title || 'Guide featured image'}
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-300 hover:scale-105"
              draggable={false}
            />
            {isEssential && (
              <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold">
                ⭐ THIẾT YẾU
              </div>
            )}
          </div>
        )}
        <div className="p-3 text-white flex flex-col flex-grow">
          <h2 className={`font-bold line-clamp-2 mb-2 ${isEssential ? 'text-lg' : 'text-base'}`}>
            {guide.title}
          </h2>
          
          <p className="text-sm text-gray-300 mb-2 line-clamp-2 flex-grow">
            {contentPreview}
          </p>
        </div>
      </div>
    </LoadingLink>
  );
}
