import Image from 'next/image';
import Link from 'next/link';
import { PostItem } from '@/types/posts';

interface GuideCardProps {
  guide: PostItem;
}

export function GuideCard({ guide }: GuideCardProps) {
  return (
    <Link href={`/guides/${guide.slug}`} className="block">
      <div className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {guide.featured_image_url && (
          <div className="relative w-full h-48">
            <Image
              src={guide.featured_image_url}
              alt={guide.title || 'Guide featured image'}
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}
        <div className="p-4">
          <h3 className="text-xl font-semibold text-card-foreground mb-2">
            {guide.title}
          </h3>
          {guide.tags && guide.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {guide.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
