import { type SchemaTypeDefinition } from 'sanity'
import { information } from './information'
import { project } from './project'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [project, information],
}
