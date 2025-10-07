import { getProjectsCached } from '@/sanity/lib/client';
import { Home as HomeView } from './views';

export default async function Page() {
  const projects = await getProjectsCached()
  return (
    <HomeView projects={projects} />
  );
}
