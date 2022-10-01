import bcrypt from 'bcryptjs'
import type { PlaceData } from 'src/types.js'

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 15
  return bcrypt.hash(password, saltRounds)
}

export function comparePassword(a: string, b: string): Promise<boolean> {
  return bcrypt.compare(a, b)
}

export const defaultPlaceData: PlaceData = {
  theme: {
    primary: '#000',
  },
  information: {
    nodes: [
      {
        content: '',
        type: 'text',
      },
    ],
  },
}
