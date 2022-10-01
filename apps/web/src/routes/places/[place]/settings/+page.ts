import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch, parent }) => {
  return {
    title: 'Configuración de la localidad',
  }
}
