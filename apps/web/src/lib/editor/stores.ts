import { browser } from '$app/environment'
import type { Editor, Range } from '@tiptap/core'
import type { SvelteComponent } from 'svelte'
import { derived, readable, writable, type Writable } from 'svelte/store'

export type CommandProps = {
  editor: Editor | null
  range: Range | null
}
export type Item = {
  title: string
  subtitle: string
  icon?: new (args: { target: any; props?: any }) => SvelteComponent
  command: (props: CommandProps) => void
}

export const slashVisible = writable(false)
export const slashItems = writable<Item[]>([])
export const slashLocation = writable({ x: 0, y: 0, height: 0 })
export const slashProps = writable<CommandProps>({ editor: null, range: null })

function createSlashLocationStore(): Writable<{
  x: number
  y: number
  height: number
}> {
  const slashLocation = createSlashLocationStore()
  const scrollY = readable(0, (set) => {
    const cb =
      typeof window !== 'undefined' ? () => set(window.screenY) : () => set(0)
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', cb, { passive: true })
    }
    cb()
    return () => {
      window.removeEventListener('scroll', cb)
    }
  })
  const relative = derived(
    [slashLocation, scrollY],
    ([$slashLocation, $scrollY]) => {
      return {
        ...$slashLocation,
        y: $slashLocation.y + $scrollY,
      }
    }
  )
  const { subscribe } = relative
  const { set, update } = slashLocation

  return {
    set,
    update,
    subscribe,
  }
}
