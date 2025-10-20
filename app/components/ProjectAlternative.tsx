import { Project as ProjectType } from "@/types/project";

export interface SanityAssetRef {
    _type: "reference"
    _ref: string
}

export interface SanityImage {
    _key: string
    _type: "image"
    alt?: string
    asset: SanityAssetRef
    blurDataURL?: string
    width?: number
    height?: number
}

export type ViewType = "singleView" | "twoView" | "threeView"

export interface View {
    _type: ViewType
    images: SanityImage[]
}

interface Props {
    project: ProjectType
}

export const ProjectAlternative: React.FC<Props> = ({ project }) => {
    const views = project.views || [];

    const viewPicker = (view: View) => {
        switch (view._type) {
            case 'singleView':
                return <div className="w-full h-full">singleView</div>;
            case 'twoView':
                return <div>twoView</div>;
            case 'threeView':
                return <div>threeView</div>;
            default:
                return null;
        }
    }

    return (
        <div className="w-full h-full flex items-center justify-center">
            {views.map((view) => viewPicker(view as View))}
        </div>
    )
}
