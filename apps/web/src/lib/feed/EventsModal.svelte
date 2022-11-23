<script lang="ts">
  import { browser } from '$app/environment'
  import { BlockEditor, NodeType, type BlocksNodes } from '$lib/block-editor'
  import BlockRenderer from '$lib/block-editor/BlockRenderer.svelte'
  import { tooltip } from '$lib/components/tooltip'
  import { pageContext, user } from '$lib/stores'
  import { trpc } from '$lib/trpc/client'
  import type { RouterTypes } from '@pkg/trpc'
  import {
    ChevronLeft24,
    ChevronRight16,
    Close24,
    EventSchedule16,
    EventSchedule24,
    Hourglass24,
  } from 'carbon-icons-svelte'
  import { createEventDispatcher, onMount } from 'svelte'
  import { writable } from 'svelte/store'
  import { fly } from 'svelte/transition'

  type Unpacked<T> = T extends (infer U)[] ? U : T

  const dispatch = createEventDispatcher<{ close: void }>()
  export let date: Date
  let events:
    | (Unpacked<RouterTypes['events']['list']['output']> & { new?: boolean })[]
    | undefined = undefined
  let event: RouterTypes['events']['get']['output'] | undefined = undefined
  let createMode = false
  let eventId: string | undefined

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

  async function createEvent() {
    const event = await trpc.events.create.mutate({
      date,
      placeId: $pageContext.context.place?.id || '',
      title,
      content: JSON.stringify($description),
    })
    events = [{ ...event, new: true }, ...(events || [])]
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
  class="bg-white border rounded-lg flex flex-col space-y-4 border-gray-300 w-full max-h-[95vh] p-2 overflow-auto pointer-events-auto lg:max-w-5/10 dark:bg-dark-400 dark:border-dark-100"
>
  <div class="flex w-full justify-between">
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
        <div class="flex space-x-1 items-center" in:fly={{ x: -5, delay: 50 }}>
          <button
            title="Atrás"
            use:tooltip
            on:click={() => {
              eventId = undefined
              event = undefined
            }}
          >
            <ChevronLeft24 />
          </button>
          <h4 class="font-bold text-xl">{event.title}</h4>
        </div>
        {#if $description.nodes.length}
          <div class="flex flex-col space-y-2 pt-2" in:fly={{ x: -5 }}>
            <BlockRenderer root={description} />
          </div>
        {/if}
      </div>
    {:else if event === undefined}
      <div class="flex flex-col space-y-4 w-full items-center justify-center">
        <Hourglass24
          class="h-12 opacity-40 animate-spin w-12 animate-duration-3000"
        />
        <div class="font-bold text-sm">Cargando evento...</div>
      </div>
    {:else}
      <div class="flex flex-col space-y-4 w-full items-center justify-center">
        <EventSchedule24 class="h-12 opacity-40 w-12" />
        <div class="font-bold text-sm">No existe el evento</div>
      </div>
    {/if}
  {:else if createMode}
    <div class="flex flex-col space-y-2">
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
    <div class="flex flex-col space-y-2 text-sm">
      <div class="font-bold text-xs">Descripción</div>
      <BlockEditor root={description} />
    </div>
  {:else if !events}
    <div class="flex flex-col space-y-4 w-full items-center justify-center">
      <Hourglass24
        class="h-12 opacity-40 animate-spin w-12 animate-duration-3000"
      />
      <div class="font-bold text-sm">Buscando eventos...</div>
    </div>
  {:else if !events.length}
    <div class="flex flex-col space-y-4 w-full items-center justify-center">
      <EventSchedule24 class="h-12 opacity-40 w-12" />
      <div class="font-bold text-sm">No existen eventos para esta fecha</div>
    </div>
  {:else}
    <div class="flex flex-col space-y-2">
      <div class="font-bold text-xs">{events.length} eventos encontrados</div>
      <div class="flex flex-col space-y-2">
        {#each events as event, idx}
          <button
            class="rounded flex bg-light-500 w-full p-2 duration-100 justify-between items-center group dark:bg-dark-900 hover:bg-light-800 hover:dark:bg-dark-100"
            class:!bg-blue-500={event.new}
            on:click={() => (eventId = event.id)}
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
            <ChevronRight16
              class="transform duration-200 group-hover:translate-x-1"
            />
          </button>
        {/each}
      </div>
    </div>
  {/if}
  {#if $user}
    <div class="flex space-x-2 items-end">
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
</div>
