import { defineField, defineType } from 'sanity'

export const highlights = defineType({
    name: 'highlights',
    title: 'Highlights',
    type: 'document',
    fields: [
        defineField({
            name: 'projects',
            title: 'Projects (max 10)',
            type: 'array',
            of: [
                {
                    type: 'reference',
                    to: [{ type: 'project' }],
                    options: { disableNew: true },
                },
            ],
            validation: (rule) => rule.max(10),
        }),
    ],
    preview: {
        select: { projects: 'projects' },
        prepare({ projects }) {
            const count = Array.isArray(projects) ? projects.length : 0
            return { title: `Highlights (${count})` }
        },
    },
})


