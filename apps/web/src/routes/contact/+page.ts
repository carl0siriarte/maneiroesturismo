import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'
export const load: PageLoad = async ({ parent }) => {
  const { contextData } = await parent()
  throw error(500, 'Error interno')
  if (contextData.layout == 'app') {
    throw error(404, 'Página no encontrada')
  }
  return {
    title: 'Contacto',
  }
}
