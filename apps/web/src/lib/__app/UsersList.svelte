<script lang="ts">
  import { watchMedia } from '$lib'
  import { trpc } from '$lib/trpc/client'
  import { tooltip } from '$lib/components/tooltip'
  import { tick } from 'svelte'
  import {
    Calendar16,
    ChevronDown16,
    ChevronLeft24,
    ChevronRight24,
    ChevronSort16,
    ChevronUp16,
    Launch16,
  } from 'carbon-icons-svelte'
  import { browser } from '$app/environment'
  import Submenu from '$lib/components/Submenu.svelte'
  import { fly } from 'svelte/transition'
  import { expoOut } from 'svelte/easing'
  import Ufo from '$lib/components/__Ufo.svelte'
  import { clamp } from '$lib/utils/math'
  import type { RouterTypes } from '@pkg/trpc'
  import { pageContext } from '$lib/stores'
  import { page } from '$app/stores'

  type QueryTypes = RouterTypes['places']['members']

  export let data: QueryTypes['output'] | undefined = undefined
  export let total: number | undefined = undefined
  export let minimal: boolean = false

  let pageNumber = 1
  $: pages = Math.ceil((total || 1) / 20)

  let frame: HTMLDivElement | undefined

  let timeout: NodeJS.Timeout
  let waitTimeout: NodeJS.Timeout
  let nameSearch = ''
  const search = (..._deps: any[]) => {
    const find = async () => {
      waitTimeout = setTimeout(() => {
        data = undefined
        total = undefined
        tick()
      }, 100)
      const filtered = await trpc.places.members.query({
        placeId: $pageContext.context.place?.id || '',
        filter: nameSearch,
        orderBy: {
          [sortBy.prop]: sortBy.sort,
        },
        page: pageNumber,
      })
      clearTimeout(waitTimeout)
      data = filtered
      wait = true
      if (frame) frame.scrollTop = 0
    }
    if (timeout) {
      clearTimeout(timeout)
    }
    if (wait) {
      timeout = setTimeout(() => find(), 500)
    } else {
      find()
    }
  }

  let wait = true

  const sorters: Record<
    Exclude<keyof NonNullable<QueryTypes['input']['orderBy']>, 'id'>,
    {
      asc: typeof sortBy
      desc: typeof sortBy
    }
  > = {
    createdAt: {
      asc: {
        prop: 'createdAt',
        sort: 'asc',
      },
      desc: {
        prop: 'createdAt',
        sort: 'desc',
      },
    },
    name: {
      asc: {
        prop: 'name',
        sort: 'asc',
      },
      desc: {
        prop: 'name',
        sort: 'desc',
      },
    },
    email: {
      asc: {
        prop: 'email',
        sort: 'asc',
      },
      desc: {
        prop: 'email',
        sort: 'desc',
      },
    },
  }

  let sortBy: {
    prop: keyof NonNullable<QueryTypes['input']['orderBy']>
    sort: 'asc' | 'desc'
  } = sorters.name.asc

  $: if (browser && sortBy) {
    wait = false
  }

  $: if (browser) {
    search(nameSearch, sortBy)
  }

  const mediaqueries = {
    small: '(max-width: 849px)',
    large: '(min-width: 850px)',
    short: '(max-height: 399px)',
    landscape: '(orientation: landscape) and (max-height: 499px)',
    tiny: '(orientation: portrait) and (max-height: 599px)',
    dark: '(prefers-color-scheme: dark)',
    noanimations: '(prefers-reduced-motion: reduce)',
  }
</script>

<div
  class="border rounded-lg flex flex-col space-y-4 bg-gray-50 border-gray-300 w-full p-4 dark:bg-dark-700 dark:border-dark-100"
>
  <div class="flex space-x-2 w-full justify-between items-center">
    <input
      class="bg-white border rounded border-gray-300 text-xs leading-tight w-full py-2 px-3 appearance-none dark:bg-dark-400 dark:border-dark-100 focus:outline-none focus:shadow-outline"
      type="search"
      bind:value={nameSearch}
      placeholder="Busca por id, nombre, rol o email"
    />
    <Submenu>
      <button
        class="border-transparent rounded flex space-x-1 border-2 p-1 duration-200 whitespace-nowrap items-center hover:border-gray-300 dark:hover:border-dark-100"
        type="button"
        slot="button"
      >
        <div class="text-xs">Ordenar por</div>
        <ChevronSort16 /></button
      >
      <div
        class="flex flex-col font-bold divide-y-1 divide-gray-300 text-xs text-gray-80 dark:divide-gray-600 dark:text-white"
        slot="body"
      >
        <div class="flex flex-col space-y-3 pb-3">
          <p class="font-bold">Nombre</p>
          <label class="flex font-normal space-x-2 text-xs">
            <input type="radio" value={sorters.name.asc} bind:group={sortBy} />
            <div class="flex space-x-1 items-center">
              <ChevronUp16 />
              <span>Ascendente</span>
            </div>
          </label>
          <label class="flex font-normal space-x-2 text-xs">
            <input
              type="radio"
              value={sorters.name.desc}
              bind:group={sortBy}
              checked
            />
            <div class="flex space-x-1 items-center">
              <ChevronDown16 />
              <span>Descendente</span>
            </div>
          </label>
        </div>
        <div class="flex flex-col space-y-3 py-3">
          <p class="font-bold">Email</p>
          <label class="flex font-normal space-x-2 text-xs">
            <input type="radio" value={sorters.email.asc} bind:group={sortBy} />
            <div class="flex space-x-1 items-center">
              <ChevronUp16 />
              <span>Ascendente</span>
            </div>
          </label>
          <label class="flex font-normal space-x-2 text-xs">
            <input
              type="radio"
              value={sorters.email.desc}
              bind:group={sortBy}
              checked
            />
            <div class="flex space-x-1 items-center">
              <ChevronDown16 />
              <span>Descendente</span>
            </div>
          </label>
        </div>
        <div class="flex flex-col space-y-3 pt-3">
          <p class="font-bold">Fecha de registro</p>
          <label class="flex font-normal space-x-2 text-xs">
            <input
              type="radio"
              value={sorters.createdAt.asc}
              bind:group={sortBy}
            />
            <div class="flex space-x-1 items-center">
              <ChevronUp16 />
              <span>Ascendente</span>
            </div>
          </label>
          <label class="flex font-normal space-x-2 text-xs">
            <input
              type="radio"
              value={sorters.createdAt.desc}
              bind:group={sortBy}
              checked
            />
            <div class="flex space-x-1 items-center">
              <ChevronDown16 />
              <span>Descendente</span>
            </div>
          </label>
        </div>
      </div>
    </Submenu>
  </div>
  {#if data && !data.items.length}
    <div
      class="flex flex-col h-full mx-auto space-y-6 w-full py-8 items-center lg:w-8/10"
      in:fly|local={{ y: 10, duration: 400, easing: expoOut }}
    >
      <div class="w-5/10 lg:w-2/10">
        <Ufo class="h-auto w-full" />
      </div>
      <div class="font-bold font-title text-xl">Nada por acá</div>
    </div>
  {:else}
    <div
      class="bg-white border rounded-lg flex border-gray-300 w-full max-h-50vh relative overflow-auto dark:bg-dark-700 dark:border-dark-100"
      bind:this={frame}
    >
      {#if !data}
        <div class="h-50vh w-full skeleton" />
      {:else}
        <table
          class="text-sm text-left w-full text-gray-500 relative overflow-auto dark:text-gray-400"
        >
          <thead
            class="bg-gray-50 text-xs top-0 text-gray-700 z-20 uppercase sticky dark:bg-dark-400 dark:text-gray-400"
          >
            <tr>
              <th scope="col" class="py-3 px-6"> Id </th>
              <th scope="col" class="text-center py-3 px-6"> Avatar </th>
              <th scope="col" class="py-3 px-6"> Nombre </th>
              <th scope="col" class="py-3 px-6"> Email </th>
              <th scope="col" class="py-3 px-6"> Rol </th>
              <th scope="col" class="py-3 px-6"> Registrado el </th>
              <th scope="col" class="text-right py-3 px-6"> Acciones </th>
            </tr>
          </thead>
          <tbody>
            {#each data.items as c, idx}
              <tr
                class="bg-white dark:bg-dark-800"
                class:border-b={idx !== data.items.length - 1}
                class:dark:border-gray-700={idx !== data.items.length - 1}
              >
                <th
                  scope="row"
                  class="font-bold py-4 px-6 text-gray-900 whitespace-nowrap dark:text-white"
                >
                  <div class="flex w-12ch">
                    <p
                      class="rounded cursor-pointer font-normal bg-gray-100 text-xs p-1 transform whitespace-nowrap overflow-ellipsis overflow-hidden dark:bg-dark-100 hover:overflow-visible "
                      title="Copy to clipboard"
                      on:click={() =>
                        typeof navigator == 'undefined'
                          ? null
                          : navigator.clipboard.writeText(c.id)}
                      use:tooltip
                    >
                      {c.id}
                    </p>
                  </div>
                </th>
                <td>
                  <div class="flex">
                    <div
                      class="bg-gradient-to-br border rounded-full cursor-pointer flex font-bold font-title mx-auto from-green-300 to-pink-600 border-gray-200 h-32px text-white text-xs min-w-32px leading-[0] w-32px items-center justify-center uppercase dark:bg-gray-600 dark:from-green-400 dark:to-pink-700"
                    >
                      {c.name[0]}
                    </div>
                  </div>
                </td>
                <td>
                  <div class="flex space-x-2 w-full py-4 px-6 items-center">
                    {#if $page.data.user?.id == c.id}
                      <span
                        class="rounded font-bold bg-gray-100 text-xs p-1 transform whitespace-nowrap overflow-ellipsis overflow-hidden dark:bg-dark-100 hover:overflow-visible"
                      >
                        Tú
                      </span>
                    {/if}
                    <p class="font-bold text-xs">
                      {c.name}
                    </p>
                  </div>
                </td>
                <td>
                  <div class="flex w-full py-4 px-6">
                    <a class="font-bold text-xs w-full" href="mailto:{c.email}">
                      {c.email}
                    </a>
                  </div>
                </td>
                <th
                  scope="row"
                  class="font-bold py-4 px-6 text-gray-900 whitespace-nowrap dark:text-white"
                >
                  <div class="flex">
                    <p
                      class="rounded bg-gray-100 text-xs p-1 transform whitespace-nowrap overflow-ellipsis overflow-hidden dark:bg-dark-100 hover:overflow-visible"
                    >
                      {c.role}
                    </p>
                  </div>
                </th>
                <td>
                  <div class="flex py-4 px-6">
                    <p class="font-bold text-xs">
                      {c.createdAt.toLocaleString()}
                    </p>
                  </div>
                </td>
                <td class="text-right py-4 px-6">
                  <div class="flex space-x-1 items-center justify-center">
                    <a
                      class="border-transparent rounded flex mx-auto border-2 p-1 duration-200 hover:border-gray-300 dark:hover:border-gray-500"
                      title="Ver publicaciones"
                      href="/?user={c.id}"
                      use:tooltip
                      type="button"><Launch16 class="flex" /></a
                    >
                    <a
                      class="border-transparent rounded flex mx-auto border-2 p-1 duration-200 hover:border-gray-300 dark:hover:border-gray-500"
                      title="Ver eventos"
                      href="/events?user={c.id}"
                      use:tooltip
                      type="button"><Calendar16 class="flex" /></a
                    >
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
    <div class="flex w-full items-center justify-between">
      <span class="font-bold text-xs leading-0">
        {data?.count || 0} usuarios encontrados
      </span>
      <div class="flex space-x-2 items-center">
        <button
          title="Previous page"
          use:tooltip
          on:click={() => {
            pageNumber = clamp({ min: 1, max: pages, val: pageNumber - 1 })
          }}
        >
          <ChevronLeft24 />
        </button>
        <div
          class="flex font-bold space-x-2 text-xs text-gray-400 uppercase items-center"
        >
          <select
            bind:value={pageNumber}
            class="bg-transparent font-bold py-1 appearance-none !border-none !outline-none"
          >
            {#each Array.from({ length: pages })
              .fill({})
              .map((_, idx) => idx + 1) as n}
              <option value={n}>{n}</option>
            {/each}
          </select>
          <span>/</span>
          <p>{pages}</p>
        </div>
        <button
          title="Next page"
          use:tooltip
          on:click={() => {
            pageNumber = clamp({ min: 1, max: pages, val: pageNumber + 1 })
          }}
        >
          <ChevronRight24 />
        </button>
      </div>
    </div>
  {/if}
</div>
