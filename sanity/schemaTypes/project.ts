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
    // Manual gallery list configuration for GalleryListView
    defineField({
      name: 'galleryListMode',
      title: 'Gallery list layout',
      type: 'string',
      options: {
        list: [
          { title: 'Single (portrait)', value: 'single' },
          { title: 'Double (two landscape)', value: 'double' },
        ],
        layout: 'radio',
      },
      initialValue: 'double',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'galleryListImages',
      title: 'Gallery list images',
      type: 'array',
      of: [
        defineField({
          name: 'galleryImage',
          title: 'Image',
          type: 'object',
          fields: [
            defineField({
              name: 'asset',
              title: 'Image',
              type: 'reference',
              to: [{ type: 'sanity.image' as any }, { type: 'sanity.imageAsset' }],
              options: {
                // Restrict asset picker to images already referenced by this project (from views or root images)
                filter: ({document}: any) => {
                  const ids = new Set<string>()
                  const addRef = (r?: any) => { if (r && typeof r._ref === 'string') ids.add(r._ref) }
                  ;(document?.images ?? []).forEach((img: any) => addRef(img?.asset))
                  ;(document?.views ?? []).forEach((v: any) => {
                    (v?.images ?? []).forEach((im: any) => addRef(im?.asset))
                  })
                  const idList = Array.from(ids)
                  // If none found, show nothing (forces user to add images to the project first)
                  return {
                    filter: idList.length ? '_id in $ids' : '__id == "never-matches"',
                    params: { ids: idList },
                  }
                },
              },
            }),
            defineField({ name: 'alt', title: 'Alt', type: 'string' }),
          ],
          preview: {
            select: { media: 'asset', title: 'alt' },
          },
        }),
      ],
      options: { layout: 'grid' },
      validation: (rule) =>
        rule.custom((images: unknown, ctx) => {
          const arr = (images as unknown[]) ?? []
          // @ts-ignore
          const mode = ctx?.parent?.galleryListMode
          if (mode === 'single' && arr.length !== 1) return 'Для режиму Single необхідно обрати рівно 1 зображення'
          if (mode === 'double' && arr.length !== 2) return 'Для режиму Double необхідно обрати рівно 2 зображення'
          return true
        }),
      description:
        'Виберіть 1 (Single) або 2 (Double) зображення для списку. Показуються лише зображення, уже додані до цього проєкту (у полях images або views[].images).',
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



