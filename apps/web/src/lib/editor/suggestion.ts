import type { SuggestionOptions } from '@tiptap/suggestion'
import {
  slashVisible,
  slashItems,
  slashLocation,
  slashProps,
  type Item,
} from './stores'

let setLocation: (() => void) | undefined

const options: Pick<SuggestionOptions, 'render' | 'items'> = {
  render() {
    return {
      onStart: ({ clientRect, editor, range, items }) => {
        if (!clientRect) return
        if (setLocation) {
          window.removeEventListener('scroll', setLocation)
        }
        setLocation = () => {
          let location = clientRect?.()
          if (location) {
            slashLocation.set({
              x: location.x,
              y: location.y + window.scrollY,
              height: location.height,
            })
          }
        }
        window.addEventListener('scroll', setLocation)
        let location = clientRect()
        if (!location) return
        slashProps.set({ editor, range })
        slashVisible.set(true)
        slashItems.set(items)
        setLocation()
      },

      onUpdate({ items }) {
        slashItems.set(items)
      },

      onKeyDown({ event }) {
        if (event.key === 'Escape') {
          slashVisible.set(false)
          return true
        }
        return false
      },

      onExit() {
        slashVisible.set(false)
        if (setLocation) {
          window.removeEventListener('scroll', setLocation)
        }
      },
    }
  },
  items({ query }): Item[] {
    const items: Item[] = [
      {
        title: 'Cabecera 1',
        subtitle: 'Ideal para títulos principales',
        command({ editor, range }) {
          if (!editor || !range) return
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode('heading', { level: 1 })
            .run()
        },
      },
      {
        title: 'Cabecera 2',
        subtitle: 'Ideal para títulos secundarios',
        command: ({ editor, range }) => {
          if (!editor || !range) return
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode('heading', { level: 2 })
            .run()
        },
      },
      {
        title: 'Cabecera 3',
        subtitle: 'Ideal para subtítulos',
        command: ({ editor, range }) => {
          if (!editor || !range) return
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setNode('heading', { level: 3 })
            .run()
        },
      },
      {
        title: 'Lista desordenada',
        subtitle: 'Lista sin enumeración',
        command: ({ editor, range }) => {
          if (!editor || !range) return
          editor.commands.deleteRange(range)
          editor.commands.toggleBulletList()
        },
      },
      {
        title: 'Lista ordenada',
        subtitle: '1, 2, 3, 4',
        command: ({ editor, range }) => {
          if (!editor || !range) return
          editor.commands.deleteRange(range)
          editor.commands.toggleOrderedList()
        },
      },
    ]
    return items
      .filter((item) =>
        item.title.toLowerCase().startsWith(query.toLowerCase())
      )
      .slice(0, 10)
  },
}

export default options
