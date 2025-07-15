import { getPostBySlug, getAllPostSlugs } from '@/lib/data/posts';
import { notFound } from 'next/navigation';
import { GuideContentRenderer } from '@/components/features/wiki/guides/GuideContentRenderer';

// Revalidate data every hour
export const revalidate = 3600;

// Generate static paths for all guide slugs
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug: slug.slug }));
}

type GuidePostPageProps = {
  params: {
    slug: string;
  };
};

export default async function GuidePostPage({ params }: GuidePostPageProps) {
  const { slug } = params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <GuideContentRenderer
      content={post.content || ''}
      title={post.title || ''}
      featuredImageUrl={post.featured_image_url || undefined}
      tags={post.tags || []}
    />
  );
}
