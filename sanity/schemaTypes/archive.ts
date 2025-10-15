import { defineField, defineType } from 'sanity'

export const archiveProject = defineType({
    name: 'archiveProject',
    title: 'Archive',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (rule) => rule.required().min(1).max(200),
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            options: { hotspot: true },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 4,
            validation: (rule) => rule.required().min(1),
        }),
    ],
    preview: {
        select: { title: 'title', media: 'image' },
        prepare({ title, media }) {
            return { title, media }
        },
    },
})


