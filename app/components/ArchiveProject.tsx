import { ArchiveProject as ArchiveProjectType } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";

interface Props {
    archiveProject: ArchiveProjectType;
    onPrev: () => void;
    onNext: () => void;
}
export const ArchiveProject: React.FC<Props> = ({ archiveProject, onPrev, onNext }) => {

    const goPrev = () => {
        onPrev();
    }

    const goNext = () => {
        onNext();
    }

    return (
        <div className="relative w-full h-full items-center justify-center flex">
            <div className="flex flex-col gap-[55px]">

                <Image
                    src={urlFor(archiveProject.image).width(800).height(600).url()}
                    alt={archiveProject.image.alt || archiveProject.title}
                    width={575}
                    height={724}
                    className="object-cover"
                />
                <h1 className="text-center w-full">{archiveProject.title}</h1>
            </div>
            <button
                type="button"
                aria-label="Previous"
                onClick={goPrev}
                className="absolute left-0 top-0 h-full w-1/2 cursor-w-resize focus:outline-none"
                style={{ background: 'transparent' }}
            />

            {/* Right click area */}
            <button
                type="button"
                aria-label="Next"
                onClick={goNext}
                className="absolute right-0 top-0 h-full w-1/2 cursor-e-resize focus:outline-none"
                style={{ background: 'transparent' }}
            />
        </div>
    )
}
