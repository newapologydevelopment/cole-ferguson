import { getProjectsCached } from '@/sanity/lib/client';
import { Preloader } from './components';
import { Home as HomeView } from './views';

export default async function Page() {
  const projects = await getProjectsCached()
  return (
    <>
      <Preloader />
      <HomeView projects={projects} />
    </>

  );
}
