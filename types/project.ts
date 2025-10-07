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

export type Project = {
    _id: string
    title: string
    images?: ProjectImage[]
}


