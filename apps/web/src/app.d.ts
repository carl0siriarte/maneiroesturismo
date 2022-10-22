declare const __API_URL__: string
declare const __LOCALHOST_HOST__: string
declare const __VERCEL_URL__: string

declare namespace App {
  interface Locals extends SessionData {
    layoutType: import('@pkg/db').LayoutType

    session: import('svelte-kit-cookie-session').Session<SessionData>
    cookies: Record<string, string>
  }
  interface Error {
    name?: string
    message?: string
    stack?: string
  }
}

interface SessionData {
  token?: string
}
