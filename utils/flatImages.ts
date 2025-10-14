import { FlatImage, Project } from "@/types"

export function collectAllImages(projects: Project[]): FlatImage[] {
    const out: FlatImage[] = []

    for (const p of projects) {
        const views = p.views ?? []
        views.forEach((v, vi) => {
            (v.images ?? []).forEach((img, ii) => {
                out.push({
                    projectId: p._id,
                    projectTitle: p.title,
                    viewType: v._type,
                    viewIndex: vi,
                    imageIndex: ii,
                    image: img,
                })
            })
        })

        const soloImages = p.images ?? []
        soloImages.forEach((img, ii) => {
            out.push({
                projectId: p._id,
                projectTitle: p.title,
                imageIndex: ii,
                image: img,
            })
        })
    }

    const counters = new Map<string, number>()
    return out.map((it) => {
        const key = it.projectId
        const next = (counters.get(key) ?? 0) + 1
        counters.set(key, next)

        const displayLabel = next === 1 ? it.projectTitle : String(next)
        return { ...it, displayLabel }
    })
}
