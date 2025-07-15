// src/app/guides/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, getAllPostSlugs } from '@/lib/data/posts'; // Import data fetching functions
import Image from 'next/image';

export async function generateStaticParams() {
  return getAllPostSlugs();
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const guide = await getPostBySlug(params.slug); // Use new data function
  if (!guide) return { title: 'Guide Not Found' };
  let excerpt = 'A guide from the wiki.';
  if (typeof guide.content === 'string') {
      const textOnly = guide.content.replace(/<[^>]+>/g, ' ');
      excerpt = textOnly.replace(/\s\s+/g, ' ').substring(0, 155) + (textOnly.length > 155 ? '...' : '');
  }
  return { title: guide.title, description: excerpt };
}

export default async function GuideDisplayPage({ params }: { params: { slug: string } }) {
  const guide = await getPostBySlug(params.slug); // Use new data function
  if (!guide) notFound();

  const contentHtml = guide.content || "<p>Content not available or in unexpected format.</p>";

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Apply Tailwind Typography for styling the HTML content from CKEditor */}
      <article className="prose dark:prose-invert lg:prose-xl max-w-3xl mx-auto">
        {guide.featured_image_url && (
          <div className="relative w-full h-96 mb-8">
            <Image
              src={guide.featured_image_url || ''} // Handle null for src
              alt={guide.title || ''}
              fill
              className="object-cover rounded-lg shadow-lg"
            />
          </div>
        )}
        <div className="mb-6 pb-4 border-b dark:border-gray-700">
            <h1 className="!mb-2 !text-3xl sm:!text-4xl md:!text-5xl font-extrabold tracking-tight leading-tight">{guide.title}</h1>
            {guide.published_at && (
                <p className="text-sm text-gray-500 dark:text-gray-400 !mt-0">
                Published: {new Date(guide.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            )}
        </div>

        {guide.tags && guide.tags.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tags:</span>
            {guide.tags.map(tag => (
                <Link key={tag.id} href={`/tags/${tag.slug}`}
                      className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800">
                    {tag.name}
                </Link>
            ))}
          </div>
        )}

        {/* Render the HTML from CKEditor */}
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </article>
    </main>
  );
}
