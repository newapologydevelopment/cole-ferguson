import { getArchiveCached } from '@/sanity/lib/client';
import { ArchiveView } from "../views";

export default async function Archive() {
  const archiveProjects = await getArchiveCached()

  return (
    <ArchiveView archiveProjects={archiveProjects} />
  );
}
