import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'
export const load: PageLoad = async ({ parent }) => {
  throw error(500, 'Error interno')
  const { contextData } = await parent()
  if (contextData.layout == 'place') {
    throw error(404, 'Página no encontrada')
  }
  return {
    title: 'Miembros',
  }
}
