import { derived, type Readable, type Writable } from 'svelte/store'
import { browser } from '$app/environment'
import { writable, get } from 'svelte/store'
import { page } from '$app/stores'
import { goto } from '$app/navigation'
import * as sj from 'superjson'
import trpc from './trpc/client'
import { Redis } from '@upstash/redis'
import {
  PUBLIC_UPSTASH_REDIS_TOKEN,
  PUBLIC_UPSTASH_REDIS_URL,
} from '$env/static/public'
import type { PageContext, Place, PlaceData, Tourist } from '@pkg/db'

const redis = new Redis({
  url: PUBLIC_UPSTASH_REDIS_URL,
  token: PUBLIC_UPSTASH_REDIS_TOKEN,
})

type Media<Query extends Record<string, string> = Record<string, string>> = {
  [K in keyof Query]?: boolean | string
} & {
  classNames: string
}

type MediaQueryLists = Record<string, MediaQueryList>

function calculateMedia(mqls: MediaQueryLists) {
  let media: Media = { classNames: '' }
  let mediaClasses: string[] = []
  for (let name in mqls) {
    media[name] = mqls[name].matches
    if (media[name]) {
      mediaClasses.push(`media-${name}`)
    }
  }
  media.classNames = mediaClasses.join(' ')
  return media
}

export function watchMedia<Query extends Record<string, string>>(
  mediaqueries: Query
) {
  return writable<Media<Query>>({ classNames: '' }, (set) => {
    if (typeof window === 'undefined') return
    let mqls: MediaQueryLists = {}
    let updateMedia = () => set(calculateMedia(mqls))
    for (let key in mediaqueries) {
      let foo = window.matchMedia(mediaqueries[key])
      mqls[key] = foo
      mqls[key].addListener(updateMedia)
    }
    updateMedia()
    return () => {
      for (let key in mqls) {
        mqls[key].removeListener(updateMedia)
      }
    }
  })
}

export function createQueryStore<T = any>(prop: string): Writable<T> {
  let query: Record<string, any> = {}
  const set = (v) => {
    // if (v) {
    query[prop] = v || ''
    // } else {
    //   delete query[prop]
    // }
    if (!browser) return
    const urlSearchParams = new URLSearchParams(query)
    const g = `?${urlSearchParams.toString()}`
    if (g !== window.location.search)
      goto(g, { keepfocus: true, replaceState: true, noscroll: true })
  }
  return {
    subscribe: (h) => {
      return page.subscribe((p) => {
        query = Object.fromEntries(p.url.searchParams.entries())
        h(query[prop])
      })
    },
    update(cb: CallableFunction) {
      const value = cb(query[prop])
      set(value)
    },
    set,
  }
}

export const pageSubtitle = writable<string | null | undefined>('')

export function persistentWritable<T>(
  key: string,
  initialValue: T
): Writable<T> {
  // create an underlying store
  const store = writable(initialValue)
  const { subscribe } = store
  // get the last value from localStorage
  const json = browser ? localStorage.getItem(key) : null

  // use the value from localStorage if it exists
  if (json) {
    store.set(sj.parse(json))
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('focus', () => {
      const json = browser ? localStorage.getItem(key) : null

      // use the value from localStorage if it exists
      if (json) {
        store.set(sj.parse(json))
      }
    })
  }

  const set = (value: T) => {
    store.set(value)
    if (!browser) return
    localStorage.setItem(key, sj.stringify(value))
  }

  // return an object with the same interface as svelte's writable()
  return {
    // capture set and write to localStorage
    set,
    // capture updates and write to localStore
    update(cb: CallableFunction) {
      const value = cb(get(store))
      set(value)
    },
    // punt subscriptions to underlying store
    subscribe,
  }
}

export function redisWritable<T>(
  initialValue?: T,
  key?: string
): Writable<T> & {
  setKey(key: string): void
} {
  // create an underlying store
  const store = writable(initialValue)
  const keyStore = writable(key)
  const { subscribe } = store

  const updateStore = (key?: string) => {
    const k = key || get(keyStore)
    if (k) {
      redis.get(k).then((d) => {
        if (!d) return
        store.set(sj.parse(JSON.stringify(d as string)))
      })
    }
  }

  keyStore.subscribe((key) => {
    updateStore(key)
  })

  if (browser) {
    updateStore()
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('focus', () => {
      updateStore()
    })
  }

  const set = (value: T) => {
    store.set(value)
    if (!browser) return
    const key = get(keyStore)
    if (key) {
      redis.set(get(keyStore), sj.stringify(value))
    }
  }

  // return an object with the same interface as svelte's writable()
  return {
    // capture set and write to localStorage
    set,
    setKey(key: string) {
      keyStore.set(key)
    },
    // capture updates and write to localStore
    update(cb: CallableFunction) {
      const value = cb(get(store))
      set(value)
    },
    // punt subscriptions to underlying store
    subscribe,
  }
}

export const preferences = persistentWritable('places:preferences', {
  darkMode: false,
})

export type TouristStore = Readable<Tourist | null | undefined> & {
  invalidate(): void
}

const createTouristStore = (): TouristStore => {
  const tick = writable(Symbol())
  const store = derived<[typeof tick], Tourist | null | undefined>(
    [tick],
    (_, set) => {
      if (!browser) {
        set(null)
        return
      }

      trpc()
        .query('tourist:whoami')
        .then((c) => {
          set(c)
        })
    },
    undefined
  )

  return {
    ...store,
    invalidate: () => {
      tick.set(Symbol())
    },
  }
}

export const tourist = createTouristStore()

export const createPageContextStore = ({
  initialState,
  editable,
  place,
}: {
  initialState?: Partial<PlaceData>
  editable?: boolean
  place?: Place
}): Writable<PlaceData> => {
  const defaultData: PlaceData = {
    header: {
      links: [],
    },
    announcementBar: {
      background: '#00FFF4',
      text: 'Create a Custom Text Decal',
      href: '/products',
      visible: true,
    },
    theme: {
      primary: '#5D2847',
    },
    footer: {
      submit: {
        title: 'Stay In The Loop',
        text: `Become a Decals Hut Insider and get 10% off your order today. Plus we'll keep you up-to-date with the latest designs.`,
      },
      links: [
        {
          title: 'Home',
          href: '/',
        },
      ],
      appendix: {
        title: 'Secure Checkout',
        text: 'We use encrypted SSL security to ensure that your credit card information is 100% protected.',
        img: 'https://cdn.shopify.com/s/files/1/0263/8249/9885/t/2/assets/ff-checkout-single.png?v=151997186021135005011631037864',
      },
    },
  }
  const placeStore = writable<PlaceData>({
    header: {
      ...(defaultData.header || {}),
      ...(initialState?.header || {}),
    },
    announcementBar: {
      ...(defaultData.announcementBar || {}),
      ...(initialState?.announcementBar || {}),
    },
    theme: {
      ...defaultData.theme,
      ...(initialState?.theme || {}),
    },
    footer: {
      ...defaultData.footer,
      ...(initialState?.footer || {}),
      appendix: {
        ...defaultData.footer.appendix,
        ...(initialState?.footer?.appendix || {}),
      },
      submit: {
        ...defaultData.footer.submit,
        ...(initialState?.footer?.submit || {}),
      },
    },
  })
  const set = (value: PlaceData) => {
    placeStore.set(value)
    if (!browser) return
    if (editable && place) {
      redis.set(`placeData:${place.id}`, sj.stringify(value))
    }
  }
  return {
    ...placeStore,
    set,
    update: (cb) => {
      set(cb(get(placeStore)))
    },
  }
}

export const pageContext = derived(
  [page],
  ([page]): PageContext => page.data.contextData
)
