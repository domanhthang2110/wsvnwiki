import Image from 'next/image';
import Link from 'next/link';
import { PostItem } from '@/types/posts';

interface GuideCardProps {
  guide: PostItem;
  isCompact?: boolean; // Make isCompact optional
}

export function GuideCard({ guide, isCompact = false }: GuideCardProps) {
  const truncateContent = (content: string | null | undefined, maxLength: number) => {
    if (!content) return '';
    const strippedContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    if (strippedContent.length <= maxLength) return strippedContent;
    return strippedContent.substring(0, maxLength) + '...';
  };

  const contentPreview = truncateContent(guide.content, 150); // Truncate content to 150 characters

  if (isCompact) {
    return (
      <div
        className="relative bg-gray-800 overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 flex flex-row items-center p-4 border-[2px] border-[#e6ce63]"
      >
        <div className="flex flex-col flex-grow text-white">
          <h2 className="text-lg font-bold line-clamp-1">
            {guide.title}
          </h2>
          {contentPreview && (
            <p className="text-sm text-gray-300 mt-1 line-clamp-2">
              {contentPreview}
            </p>
          )}
          {guide.tags && guide.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {guide.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-white text-xs px-2 py-1"
                  style={{ backgroundColor: '#cc7722' }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
          <Link
            href={`/guides/${guide.slug}`}
            className="mt-auto pt-2 text-blue-400 hover:underline text-sm self-start"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative bg-gray-800 overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 flex flex-col min-h-[300px] border-[2px] border-[#e6ce63]"
    >
      {guide.featured_image_url && (
        <div className="relative w-full h-48 flex-shrink-0">
          <Image
            src={guide.featured_image_url}
            alt={guide.title || 'Guide featured image'}
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-300"
            draggable={false}
          />
        </div>
      )}
      <div className="p-6 text-white flex flex-col flex-grow">
        <h2 className="text-xl font-bold line-clamp-none">
          {guide.title}
        </h2>
        {contentPreview && (
          <p className="text-sm text-gray-300 mt-2 line-clamp-3">
            {contentPreview}
          </p>
        )}
        {guide.tags && guide.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {guide.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-white text-xs px-2 py-1"
                style={{ backgroundColor: '#cc7722' }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
        <Link
          href={`/guides/${guide.slug}`}
          className="mt-auto pt-4 text-blue-400 hover:underline text-sm self-start"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}
