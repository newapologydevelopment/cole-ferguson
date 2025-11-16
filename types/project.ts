export type SanityImageAssetRef = {
    _type: 'reference'
    _ref: string
}

export type ProjectImage = {
    _type?: string
    asset?: SanityImageAssetRef
    alt: string
    blurDataURL?: string
    width?: number
    height?: number
    ratio?: '16:10' | '5:4' | '4:5' | '3:2' | '2:3' | '1:1'
}

export type ProjectViewSingle = {
    _type?: 'singleView'
    images: ProjectImage[] // length 1
}

export type ProjectViewTwo = {
    _type?: 'twoView'
    images: ProjectImage[] // length 2
}

export type ProjectViewThree = {
    _type?: 'threeView'
    images: ProjectImage[] // length 3
}

export type ProjectView = ProjectViewSingle | ProjectViewTwo | ProjectViewThree

export type Project = {
    _id: string
    title: string
    slug?: { current: string }
    images?: ProjectImage[]
    views?: ProjectView[]
    // Manual gallery list config
    galleryListMode?: 'single' | 'double'
    galleryListImages?: ProjectImage[]
}

export type FlatImage = {
    projectId: string
    projectTitle: string
    viewType?: ProjectView['_type']
    viewIndex?: number
    imageIndex: number
    image: ProjectImage
    displayLabel?: string
}

export type ArchiveProject = {
    _id: string
    title: string
    image: ProjectImage;
}


