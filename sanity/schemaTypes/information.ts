import { defineField, defineType } from 'sanity'

export const information = defineType({
    name: 'information',
    title: 'Information',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            initialValue: 'Cole is a photographer and director living in Los Angeles, California.',
            validation: (rule) => rule.required().min(3),
        }),
        defineField({
            name: 'clients',
            title: 'Clients',
            type: 'text',
            rows: 4,
        }),
        defineField({
            name: 'publications',
            title: 'Publications',
            type: 'text',
            rows: 4,
        }),
        defineField({
            name: 'contact',
            title: 'Contact',
            type: 'text',
            rows: 3,
        }),
        defineField({
            name: 'video',
            title: 'Video',
            type: 'url',
            description: 'Optional video URL (e.g., Vimeo/YouTube) or upload a file below',
        }),
        defineField({
            name: 'videoFile',
            title: 'Video File',
            type: 'file',
            options: { accept: 'video/*' },
        }),
        defineField({
            name: 'cover',
            title: 'Cover Image',
            type: 'image',
            description: 'Cover image shown when video is not available',
            options: {
                hotspot: true,
            },
        }),
    ],
    preview: {
        select: { title: 'title' },
    },
})
