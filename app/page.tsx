import { getHighlightsCached, getProjectsCached } from '@/sanity/lib/client';
import { Preloader } from './components';
import { Home as HomeView } from './views';

export default async function Page() {
  const projects = await getProjectsCached()
  const highlights = await getHighlightsCached()

  console.log('highlights', highlights)
  return (
    <>
      <Preloader />
      <HomeView projects={highlights} />
    </>

  );
}
