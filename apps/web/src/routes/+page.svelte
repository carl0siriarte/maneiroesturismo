<script>
  import { goto } from '$app/navigation'
  import { tooltip } from '$lib/components/tooltip'
  import { getAbsoluteURL } from '$lib/utils/host'
  import { search } from '$lib/utils/search'
  import PlaceCard from '$lib/__app/PlaceCard.svelte'
  import {
    Close16,
    Launch16,
    Map24,
    Map32,
    MapCenter24,
    MapCenter32,
    Search16,
  } from 'carbon-icons-svelte'
  import { flip } from 'svelte/animate'
  import { expoOut } from 'svelte/easing'
  import { fly } from 'svelte/transition'

  /** @type {import('./$types').PageData} */
  export let data

  let searchTerm = ''

  $: places = search(data.places.items, searchTerm, ['slug', 'name'])
</script>

<div class="flex flex-col space-y-6 w-full">
  <div class="flex space-x-4 w-full items-center">
    <MapCenter24 />
    <h2 class="font-bold font-title text-black text-2xl dark:text-white ">
      Tus localidades
    </h2>
  </div>

  <div class="relative">
    <div
      class="flex w-full px-3 inset-0 absolute pointer-events-none items-center justify-between"
      class:opacity-50={!searchTerm}
    >
      <Search16 />
      {#if searchTerm}
        <button
          type="button"
          on:click={() => (searchTerm = '')}
          class="pointer-events-auto"
          title="Limpiar búsqueda"
          use:tooltip
        >
          <Close16 />
        </button>
      {/if}
    </div>
    <input
      class="bg-white border rounded border-gray-300 text-xs leading-tight w-full py-2 px-3 pl-[calc(24px+16px)] appearance-none dark:bg-dark-700 dark:border-dark-400 focus:outline-none focus:shadow-outline disabled:bg-gray-200 disabled:text-gray-500 disabled:dark:bg-dark-900"
      type="text"
      pattern="(https?|http?|/).*?"
      autocomplete="nooooope"
      aria-autocomplete="none"
      placeholder="Busca una localidad..."
      class:italic={!searchTerm}
      bind:value={searchTerm}
    />
  </div>

  {#if places.length}
    <div
      class="w-full grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      transition:fly|local={{ duration: 400, y: 5 }}
    >
      {#each places as place (place.slug)}
        <div class="flex" animate:flip={{ duration: 400, easing: expoOut }}>
          <PlaceCard {place} />
        </div>
      {/each}
    </div>
  {/if}
</div>
