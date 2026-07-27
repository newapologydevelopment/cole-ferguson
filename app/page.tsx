import { getHomepageProjectsCached } from '@/sanity/lib/client';
import { Home as HomeView } from './views';

export default async function Page() {
  const projects = await getHomepageProjectsCached();

  return <HomeView projects={projects} />;
}
