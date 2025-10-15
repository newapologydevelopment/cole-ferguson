import { ProjectView } from '@/app/views'
import { getProjectBySlugCached } from '@/sanity/lib/client'
import { notFound } from 'next/navigation'


type PageParams = { slug: string }

export default async function ProjectPage({
    params,
}: {
    params: Promise<PageParams>
}) {
    const { slug } = await params

    const project = await getProjectBySlugCached(slug)
    if (!project) {
        notFound() // віддасть 404 сторінку
    }

    return <ProjectView project={project} />
}
