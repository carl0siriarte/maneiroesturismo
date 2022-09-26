import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 15
  return bcrypt.hash(password, saltRounds)
}

export function comparePassword(a: string, b: string): Promise<boolean> {
  return bcrypt.compare(a, b)
}
