import { type SchemaTypeDefinition } from 'sanity'
import { archiveProject } from './archive'
import { highlights } from './highlights'
import { information } from './information'
import { project } from './project'
import { preloader } from './preloader'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [project, information, archiveProject, highlights, preloader],
}
