import { getHighlightsCached } from '@/sanity/lib/client';
// import { Home as HomeView } from './views';

export default async function Page() {
  const highlights = await getHighlightsCached();

  return (
    <div className="h-[100dvh] snap-y snap-mandatory overflow-y-auto">
      {highlights.map((project) => (
        <div
          className="w-full h-full flex items-center justify-center bg-yellow-200 snap-start p-4"
          key={project._id}
        >
          {project.title}
        </div>
      ))}
    </div>
  );
}
