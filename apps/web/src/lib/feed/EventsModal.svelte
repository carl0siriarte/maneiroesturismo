<script lang="ts">
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { BlockEditor, NodeType, type BlocksNodes } from '$lib/block-editor'
  import BlockRenderer from '$lib/block-editor/BlockRenderer.svelte'
  import Submenu from '$lib/components/Submenu.svelte'
  import { tooltip } from '$lib/components/tooltip'
  import { pageContext, user } from '$lib/stores'
  import { trpc } from '$lib/trpc/client'
  import { getAbsoluteURL } from '$lib/utils/host'
  import type { RouterTypes } from '@pkg/trpc'
  import {
    AddComment16,
    ChevronLeft24,
    ChevronRight16,
    Close24,
    EventSchedule16,
    EventSchedule24,
    Hourglass24,
    Image16,
    Link16,
    List24,
    LocationPerson16,
    LocationPerson24,
    LocationPersonFilled24,
    LogoFacebook16,
    LogoTwitter16,
    Share24,
  } from 'carbon-icons-svelte'
  import { createEventDispatcher, onMount } from 'svelte'
  import { writable } from 'svelte/store'
  import { fly } from 'svelte/transition'
  import Commentaries from './Commentaries.svelte'

  type Unpacked<T> = T extends (infer U)[] ? U : T

  const dispatch = createEventDispatcher<{ close: void }>()
  export let date: Date
  let events:
    | (Unpacked<RouterTypes['events']['list']['output']> & { new?: boolean })[]
    | undefined = undefined
  let event: RouterTypes['events']['get']['output'] | undefined = undefined
  let createMode = false

  $: eventId = $page.url.searchParams.get('eventId') || undefined

  onMount(async () => {
    if (!browser) return
    events = (
      await trpc.events.list.query({
        year: date.getFullYear(),
        placeId: $pageContext.context.place?.id || '',
        month: date.getMonth() + 1,
      })
    ).filter((e) => e.date.getDate() == date.getDate())
  })

  let title = ''

  let description = writable<BlocksNodes<any>>({
    nodes: [
      {
        id: crypto.randomUUID(),
        content: '',
        type: NodeType.text,
      },
    ],
  })

  function eventURL(id: string) {
    let searchParams = new URLSearchParams($page.url.searchParams)
    searchParams.set('eventId', id)
    return $page.url.pathname + '?' + searchParams.toString()
  }

  function dateURL(date: Date) {
    let searchParams = new URLSearchParams($page.url.searchParams)
    searchParams.delete('eventId')
    searchParams.set('date', date.toISOString())
    return $page.url.pathname + '?' + searchParams.toString()
  }

  function shareURL() {
    let searchParams = new URLSearchParams()
    searchParams.set('eventId', event?.id || '')
    searchParams.set('date', date.toISOString())
    const path = '/events' + '?' + searchParams.toString()
    return getAbsoluteURL({
      subdomain: $pageContext.context.place?.slug || '',
      path,
    })
  }

  async function createEvent() {
    const event = await trpc.events.create.mutate({
      date,
      placeId: $pageContext.context.place?.id || '',
      title,
      content: JSON.stringify($description),
    })
    events = [
      {
        ...event,
        new: true,
        confirmed: false,
        _count: {
          CommentOnEvent: 0,
          confirmations: 0,
        },
      },
      ...(events || []),
    ]
  }

  async function viewEvent() {
    if (!eventId) return
    event = await trpc.events.get.query(eventId)
    if (event) {
      $description = JSON.parse(event.content || '')
    }
  }

  $: if (eventId) {
    viewEvent()
  }

  function randomUUID() {
    return crypto.randomUUID()
  }
</script>

<div
  class="bg-white border rounded-lg flex flex-col space-y-2 border-gray-300 w-full max-h-[95vh] overflow-auto pointer-events-auto lg:max-w-5/10 dark:bg-dark-400 dark:border-dark-100"
>
  <div class="flex w-full p-2 justify-between">
    <div class="flex space-x-2 items-center">
      <EventSchedule24 />
      <h3 class="font-bold">{date.toDateString()}</h3>
    </div>
    <button
      class="flex"
      title="Cerrar modal"
      use:tooltip
      on:click={() => dispatch('close')}
    >
      <Close24 />
    </button>
  </div>
  {#if eventId}
    {#if event}
      <div
        class="flex flex-col space-y-2 divide-y-1 divide-gray-300 text-sm dark:divide-dark-100"
      >
        <div
          class="flex flex-col space-y-1 px-2 items-center"
          in:fly={{ x: -5, delay: 50 }}
        >
          <div class="flex space-x-2 w-full items-center">
            <a
              class="flex"
              href={dateURL(date)}
              data-sveltekit-noscroll
              title="Ver todos los eventos"
              use:tooltip><List24 class="flex" /></a
            >
            <div class="flex space-x-2 items-center">
              {#if event?.author}
                <div
                  class="bg-gradient-to-br border rounded-full cursor-pointer flex font-bold font-title from-green-300 to-sky-800 border-gray-200 h-32px text-white text-xs leading-[0] w-32px items-center justify-center uppercase dark:bg-gray-600 dark:from-green-400 dark:to-sky-900"
                >
                  {event.author.name[0]}
                </div>
              {:else}
                <div
                  class="bg-white rounded-full flex border-2 border-gray-300 min-h-12 min-w-12 items-center justify-center dark:bg-dark-400 dark:border-dark-100"
                >
                  <Image16 />
                </div>
              {/if}
              <div class="flex flex-col space-y-1">
                <h4 class="text-black text-xs dark:text-white ">
                  <strong>
                    {event?.author?.name || $pageContext.context.place?.name}
                  </strong>
                </h4>
                <div class="text-xs text-gray-500">
                  Publicado el {event.createdAt.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          <h4 class="font-bold text-xl w-full">{event.title}</h4>
        </div>
        {#if $description.nodes.length}
          <div class="flex flex-col space-y-2 px-2 pt-2" in:fly={{ x: -5 }}>
            <BlockRenderer root={description} />
          </div>
        {/if}
        <div
          class="border-t flex flex-col space-y-4 border-gray-300 w-full px-2 pt-2 overflow-auto dark:border-dark-100"
        >
          <h4 class="font-bold text-sm">
            {event._count?.CommentOnEvent || 0} Comentarios
          </h4>
          <Commentaries postId={event.id} origin="event" />
        </div>
      </div>
    {:else if event === undefined}
      <div
        class="flex flex-col space-y-4 w-full p-2 items-center justify-center"
      >
        <Hourglass24
          class="h-12 opacity-40 animate-spin w-12 animate-duration-3000"
        />
        <div class="font-bold text-sm">Cargando evento...</div>
      </div>
    {:else}
      <div
        class="flex flex-col space-y-4 w-full p-2 items-center justify-center"
      >
        <EventSchedule24 class="h-12 opacity-40 w-12" />
        <div class="font-bold text-sm">No existe el evento</div>
      </div>
    {/if}
  {:else if createMode}
    <div class="flex flex-col space-y-2 px-2">
      <div class="font-bold text-xs">Nombre del evento</div>
      <input
        class="bg-white border rounded border-gray-300 text-xs leading-tight w-full py-2 px-3 pr-[calc(24px+24px+16px)] appearance-none dark:bg-dark-600 dark:border-dark-100 focus:outline-none focus:shadow-outline disabled:bg-gray-200 disabled:text-gray-500 disabled:dark:bg-dark-900"
        type="text"
        autocomplete="nooooope"
        aria-autocomplete="none"
        placeholder="Ej. Feria del emprendimiento"
        bind:value={title}
      />
    </div>
    <div class="flex flex-col space-y-2 text-sm px-2">
      <div class="font-bold text-xs">Descripción</div>
      <BlockEditor root={description} />
    </div>
  {:else if !events}
    <div class="flex flex-col space-y-4 w-full p-2 items-center justify-center">
      <Hourglass24
        class="h-12 opacity-40 animate-spin w-12 animate-duration-3000"
      />
      <div class="font-bold text-sm">Buscando eventos...</div>
    </div>
  {:else if !events.length}
    <div class="flex flex-col space-y-4 w-full p-2 items-center justify-center">
      <EventSchedule24 class="h-12 opacity-40 w-12" />
      <div class="font-bold text-sm">No existen eventos para esta fecha</div>
    </div>
  {:else}
    <div class="flex flex-col space-y-2 px-2 pb-2">
      <div class="font-bold text-xs">{events.length} eventos encontrados</div>
      <div class="flex flex-col space-y-2">
        {#each events as event, idx}
          <a
            class="rounded flex bg-light-500 w-full p-2 duration-100 justify-between items-center group dark:bg-dark-900 hover:bg-light-800 hover:dark:bg-dark-100"
            class:!bg-blue-500={event.new}
            href={eventURL(event.id)}
            data-sveltekit-noscroll
            in:fly={{ x: -5, delay: 100 * idx }}
          >
            <div class="flex flex-grow space-x-2 items-center">
              <EventSchedule16 />
              <div
                class="font-bold text-sm max-w-[28ch] overflow-hidden whitespace-nowrap overflow-ellipsis lg:max-w-[48ch]"
              >
                {event.title}
              </div>
            </div>
            <div
              class="flex space-x-2 transform duration-200 items-center group-hover:translate-x-1"
              style="will-change: transform"
            >
              <div class="flex space-x-1 items-center">
                <LocationPerson16 />
                <div class="font-bold text-xs">
                  {event._count.confirmations || 0}
                </div>
              </div>
              <div class="flex space-x-1 items-center">
                <AddComment16 />
                <div class="font-bold text-xs">
                  {event._count.CommentOnEvent || 0}
                </div>
              </div>
              <ChevronRight16 class="" />
            </div>
          </a>
        {/each}
      </div>
    </div>
  {/if}
  {#if $user && !eventId}
    <div class="flex space-x-2 px-2 pb-2 items-end">
      {#if createMode}
        <button
          disabled={!events}
          class="rounded font-bold ml-auto border-2 border-red-500 text-xs py-1 px-2 text-red-500 duration-200 disabled:cursor-not-allowed disabled:opacity-50 not-disabled:hover:bg-red-500 not-disabled:hover:text-white"
          on:click={() => {
            $description = {
              nodes: [
                {
                  id: randomUUID(),
                  content: '',
                  type: NodeType.text,
                },
              ],
            }
            createMode = !createMode
          }}>Cancelar</button
        >
      {/if}
      {#if !eventId}
        <button
          disabled={!events || (!title && createMode)}
          class="rounded font-bold ml-auto border-2 border-blue-500 text-xs py-1 px-2 text-blue-500 duration-200 disabled:cursor-not-allowed disabled:opacity-50 not-disabled:hover:bg-blue-500 not-disabled:hover:text-white"
          on:click={async () => {
            if (createMode) {
              await createEvent()
            }
            $description = {
              nodes: [
                {
                  id: randomUUID(),
                  content: '',
                  type: NodeType.text,
                },
              ],
            }
            title = ''
            createMode = !createMode
          }}>{createMode ? 'Guardar evento' : 'Crear evento'}</button
        >
      {/if}
    </div>
  {/if}
  {#if eventId && event}
    <div
      class="border-t flex divide-x-1 divide-gray-300 border-gray-300 w-full text-gray-400 kiosk dark:divide-dark-100 dark:border-dark-100"
    >
      <button
        class="flex space-x-2 p-2 duration-100 items-center justify-center hover:text-green-500"
        class:!text-green-500={event.confirmed}
        title={'Confirmar asistencia'}
        type="button"
        on:click={() => {
          if (!event) {
            return
          }
          if (!$user) {
            goto('/login')
            return
          }
          event = {
            ...event,
            _count: {
              CommentOnEvent: event._count?.CommentOnEvent ?? 0,
              confirmations: event.confirmed
                ? (event._count?.confirmations || 0) - 1
                : (event._count?.confirmations || 0) + 1,
            },
          }
          event.confirmed = !event.confirmed
          trpc.events.confirm.mutate(event.id)
        }}
        use:tooltip
      >
        {#if event.confirmed}
          <LocationPersonFilled24 class="flex" />
        {:else}
          <LocationPerson24 class="flex" />
        {/if}
        <span class="font-bold text-xs">{event._count?.confirmations || 0}</span
        >
      </button>
      <Submenu y="top">
        <button
          slot="button"
          class="flex w-full p-2 z-90 duration-100 items-center justify-center hover:text-dark-900 dark:hover:text-gray-100"
        >
          <Share24 />
        </button>
        <div
          class="flex flex-col font-bold space-y-3 text-xs text-gray-800 items-end dark:text-white"
          slot="body"
        >
          <a
            class="flex font-bold space-x-2 items-center disabled:cursor-not-allowed disabled:opacity-50 hover:not-disabled:underline"
            target="_blank"
            href="https://www.facebook.com/sharer.php?u={encodeURIComponent(
              shareURL()
            )}"
          >
            <span>Compartir en Facebook</span>
            <LogoFacebook16 class="flex" />
          </a>
          <a
            class="flex font-bold space-x-2 items-center disabled:cursor-not-allowed disabled:opacity-50 hover:not-disabled:underline"
            target="_blank"
            href="https://twitter.com/intent/tweet?url={encodeURIComponent(
              shareURL()
            )}"
          >
            <span>Compartir en Twitter</span>
            <LogoTwitter16 class="flex" />
          </a>
          <button
            class="flex font-bold space-x-2 items-center disabled:cursor-not-allowed disabled:opacity-50 hover:not-disabled:underline"
            on:click={() => {
              if (!browser) return
              navigator.clipboard.writeText(shareURL())
            }}
          >
            <span>Copiar link en portapapeles</span>
            <Link16 class="flex" />
          </button>
        </div></Submenu
      >
    </div>
  {/if}
</div>

<style>
  .kiosk > :global(*) {
    @apply w-1/2;
  }
</style>
