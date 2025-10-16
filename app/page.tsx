import { getHighlightsCached } from '@/sanity/lib/client';
import { Home as HomeView } from './views';

export default async function Page() {
  const highlights = await getHighlightsCached()

  return (
    <HomeView projects={highlights} />
  );
}
