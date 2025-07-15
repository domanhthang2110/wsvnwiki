import { GetStaticPropsContext } from 'next'; // only for pages directory
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPostSlugs } from '@/lib/data/posts';
import { GuideContentRenderer } from '@/components/features/wiki/guides/GuideContentRenderer';

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug: slug.slug }));
}

// ✅ Fix typing here
export default async function GuidePostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);

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
