<script>
  import { goto } from '$app/navigation'
  import { pageContext } from '$lib'
  import { tooltip } from '$lib/components/tooltip'
  import Ufo from '$lib/components/__Ufo.svelte'
  import { search } from '$lib/utils/search'
  import PlaceCard from '$lib/__app/PlaceCard.svelte'
  import Main from '$lib/__layouts/app/shell/Main.svelte'
  import { Close16, Map32, MapCenter24, Search16 } from 'carbon-icons-svelte'
  import { flip } from 'svelte/animate'
  import { expoOut } from 'svelte/easing'
  import { fly } from 'svelte/transition'

  /** @type {import('./$types').PageData} */
  export let data

  let searchTerm = ''

  $: places = data.places
    ? search(data.places.items, searchTerm, ['slug', 'name'])
    : undefined
</script>

{#if data.contextData.layout == 'app' && places}
  <Main class="flex flex-col flex-grow h-full space-y-6 w-full">
    <div class="flex space-x-4 w-full items-center">
      <MapCenter24 />
      <h2 class="font-bold font-title text-black text-2xl dark:text-white ">
        Tus localidades
      </h2>
    </div>

    {#if $pageContext.context.places?.length}
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
          in:fly|local={{ duration: 400, y: 5 }}
        >
          {#each places as place (place.slug)}
            <div class="flex" animate:flip={{ duration: 400, easing: expoOut }}>
              <PlaceCard {place} />
            </div>
          {/each}
        </div>
      {:else}
        <div
          class="flex flex-grow flex-col h-full space-y-6 w-full items-center justify-center"
          in:fly|local={{ duration: 400, y: 5 }}
        >
          <Map32 class="h-48px w-48px" />
          <div class="font-bold text-2xl">No se encuentran resultados</div>
          <a
            class="rounded-lg font-bold border-2 border-blue-500 text-sm py-2 px-2 transform-gpu text-blue-500 duration-200 hover:shadow disabled:cursor-not-allowed disabled:opacity-70 not-disabled:hover:scale-98"
            href="/places/new">Crear una localidad</a
          >
        </div>
      {/if}
    {:else}
      <div
        class="flex flex-grow flex-col h-full space-y-4 w-full items-center justify-center"
      >
        <Map32 class="h-48px w-48px" />
        <div class="font-bold text-2xl">No tienes localidades</div>
        <a
          class="rounded-lg font-bold border-2 border-blue-500 text-sm py-2 px-2 transform-gpu text-blue-500 duration-200 hover:shadow disabled:cursor-not-allowed disabled:opacity-70 not-disabled:hover:scale-98"
          href="/places/new">Crear una localidad</a
        >
      </div>
    {/if}
  </Main>
{/if}
