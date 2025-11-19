import type { StructureResolver } from 'sanity/structure'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Content')
    .items([
      // Orderable list for main projects
      orderableDocumentListDeskItem({
        type: 'project',
        title: 'Projects',
        S,
        context,
      }),
      // Orderable list for archive projects
      orderableDocumentListDeskItem({
        type: 'archiveProject',
        title: 'Archive',
        S,
        context,
      }),
      S.divider(),
      // All other document types, крім тих, для яких вже є orderable-списки
      ...S.documentTypeListItems().filter((listItem) => {
        const id = listItem.getId()
        return id !== 'project' && id !== 'archiveProject'
      }),
    ])
