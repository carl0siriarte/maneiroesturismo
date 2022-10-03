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
        title: 'Heading 1',
        subtitle: 'BIG heading',
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
        title: 'Heading 2',
        subtitle: 'Less Big heading',
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
        title: 'Heading 3',
        subtitle: 'Medium big heading',
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
        title: 'Bullet List',
        subtitle: 'Pew pew pew',
        command: ({ editor, range }) => {
          if (!editor || !range) return
          editor.commands.deleteRange(range)
          editor.commands.toggleBulletList()
        },
      },
      {
        title: 'Numbered List',
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
