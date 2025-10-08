import { defineField, defineType } from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Projects',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().min(1).max(200),
    }),
    // New: views with 1/2/3 images per screen
    defineField({
      name: 'views',
      title: 'Views',
      type: 'array',
      of: [
        {
          name: 'singleView',
          title: 'Single Image View',
          type: 'object',
          fields: [
            defineField({
              name: 'images',
              title: 'Images',
              type: 'array',
              of: [{ type: 'image', options: { hotspot: true } }],
              validation: (rule) => rule.required().min(1).max(1),
              options: { layout: 'grid' },
            }),
          ],
          preview: {
            select: { media: 'images.0' },
            prepare({ media }) {
              return { title: 'One Image', media }
            },
          },
        },
        {
          name: 'twoView',
          title: 'Two Images View',
          type: 'object',
          fields: [
            defineField({
              name: 'images',
              title: 'Images',
              type: 'array',
              of: [{ type: 'image', options: { hotspot: true } }],
              validation: (rule) => rule.required().min(2).max(2),
              options: { layout: 'grid' },
            }),
          ],
          preview: {
            select: { media: 'images.0' },
            prepare({ media }) {
              return { title: 'Two Images', media }
            },
          },
        },
        {
          name: 'threeView',
          title: 'Three Images View',
          type: 'object',
          fields: [
            defineField({
              name: 'images',
              title: 'Images',
              type: 'array',
              of: [{ type: 'image', options: { hotspot: true } }],
              validation: (rule) => rule.required().min(3).max(3),
              options: { layout: 'grid' },
            }),
          ],
          preview: {
            select: { media: 'images.0' },
            prepare({ media }) {
              return { title: 'Three Images', media }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'views.0.images.0',
      viewType: 'views.0._type',
    },
    prepare({ title, media, viewType }) {
      const subtitle = viewType === 'twoView' ? 'Two Images' : viewType === 'threeView' ? 'Three Images' : 'One Image'
      return { title, subtitle, media }
    },
  },
})



