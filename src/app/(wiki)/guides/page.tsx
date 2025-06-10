import { getPosts, getAllTags } from '@/lib/data/posts';
import GuidesClientPage from './GuidesClientPage'; // Import the client component

export const revalidate = 3600; // Revalidate data every hour

export default async function GuidesServerPage() {
  const guidesData = await getPosts({ typeSlug: 'guide' });
  const tagsData = await getAllTags();

  return (
    <GuidesClientPage initialGuides={guidesData} initialTags={tagsData} />
  );
}
