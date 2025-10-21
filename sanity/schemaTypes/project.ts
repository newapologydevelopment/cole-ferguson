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
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input: string) =>
          input
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/--+/g, '-')
            .replace(/^-+|-+$/g, ''),
      },
      // Тимчасово приховуємо slug зі студії
      hidden: true,
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
              of: [{
                type: 'image',
                options: { hotspot: true },
                fields: [
                  defineField({
                    name: 'ratio',
                    title: 'Aspect ratio (optional)',
                    type: 'string',
                    options: {
                      list: [
                        { title: '16:10', value: '16:10' },
                        { title: '5:4', value: '5:4' },
                        { title: '4:5', value: '4:5' },
                        { title: '3:2', value: '3:2' },
                        { title: '2:3', value: '2:3' },
                        { title: '1:1', value: '1:1' },
                      ],
                    },
                  }),
                  defineField({ name: 'alt', title: 'Alt', type: 'string' }),
                ],
              }],
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
              of: [{
                type: 'image',
                options: { hotspot: true },
                fields: [
                  defineField({
                    name: 'ratio',
                    title: 'Aspect ratio (optional)',
                    type: 'string',
                    options: {
                      list: [
                        { title: '16:10', value: '16:10' },
                        { title: '5:4', value: '5:4' },
                        { title: '4:5', value: '4:5' },
                        { title: '3:2', value: '3:2' },
                        { title: '2:3', value: '2:3' },
                        { title: '1:1', value: '1:1' },
                      ],
                    },
                  }),
                  defineField({ name: 'alt', title: 'Alt', type: 'string' }),
                ],
              }],
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
              of: [{
                type: 'image',
                options: { hotspot: true },
                fields: [
                  defineField({
                    name: 'ratio',
                    title: 'Aspect ratio (optional)',
                    type: 'string',
                    options: {
                      list: [
                        { title: '16:10', value: '16:10' },
                        { title: '5:4', value: '5:4' },
                        { title: '4:5', value: '4:5' },
                        { title: '3:2', value: '3:2' },
                        { title: '2:3', value: '2:3' },
                        { title: '1:1', value: '1:1' },
                      ],
                    },
                  }),
                  defineField({ name: 'alt', title: 'Alt', type: 'string' }),
                ],
              }],
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



