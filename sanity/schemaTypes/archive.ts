import { defineField, defineType } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

export const archiveProject = defineType({
    name: 'archiveProject',
    title: 'Archive',
    type: 'document',
    orderings: [orderRankOrdering],
    fields: [
        orderRankField({ type: 'archiveProject' }),
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


