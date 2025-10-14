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
    images?: ProjectImage[]
    views?: ProjectView[]
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


