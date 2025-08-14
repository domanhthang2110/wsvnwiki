import { getPostBySlug, getAllPostSlugs } from '@/lib/data/posts';
import { notFound } from 'next/navigation';
import { GuideContentRenderer } from '@/components/features/wiki/guides/GuideContentRenderer';
import { PostPageWrapper } from '@/components/features/wiki/guides/PostPageWrapper';

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) {
    notFound();
  }
  
  return (
    <PostPageWrapper>
      <GuideContentRenderer
        content={post.content || ''}
        title={post.title || ''}
        featuredImageUrl={post.featured_image_url || undefined}
        tags={post.tags || []}
      />
    </PostPageWrapper>
  );
}
