import { defineField, defineType } from 'sanity'

export const preloader = defineType({
  name: 'preloader',
  title: 'Preloader',
  type: 'document',
  fields: [
    defineField({
      name: 'images',
      title: 'Images (in order)',
      type: 'array',
      of: [
        defineField({
          name: 'imageItem',
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt', type: 'string' }),
          ],
          // Validate asset file size (e.g. <= 300KB). Adjust as needed.
          validation: (rule) =>
            rule.custom(async (value, ctx) => {
              const ref = value?.asset?._ref
              if (!ref) return true
              const asset = await ctx
                .getClient({ apiVersion: '2023-10-01' })
                .fetch(
                  '*[_id == $id][0]{size, mimeType, "w": metadata.dimensions.width, "h": metadata.dimensions.height}',
                  { id: ref }
                )
              if (!asset) return 'Asset not found'
              if (asset.size && asset.size > 307200) return 'Максимальний розмір 300KB'
              return true
            }),
        }),
      ],
      validation: (rule) => rule.min(0).max(20),
      options: { layout: 'grid' },
    }),
  ],
  preview: {
    select: { media: 'images.0' },
    prepare({ media }) {
      return { title: 'Preloader', subtitle: 'Custom preloader images', media }
    },
  },
})


