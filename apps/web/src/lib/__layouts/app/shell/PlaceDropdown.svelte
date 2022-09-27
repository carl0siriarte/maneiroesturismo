<script>
  import Submenu from '$lib/components/Submenu.svelte'
  import { tooltip } from '$lib/components/tooltip'
  import { pageContext } from '$lib/stores'
  import { getAbsoluteURL } from '$lib/utils/host'
  import {
    Add16,
    Home16,
    Launch16,
    Map16,
    OverflowMenuVertical16,
  } from 'carbon-icons-svelte'

  export let fullWidth = false
</script>

<Submenu {fullWidth}>
  <div class="flex h-full content items-center" slot="button">
    <div
      class="border rounded cursor-pointer flex space-x-2 bg-gray-50 border-gray-300 text-xs min-w-182px p-2 items-center justify-between dark:bg-dark-500 dark:border-dark-100"
      class:w-full={fullWidth}
    >
      {#if $pageContext.context.place}
        <div class="flex space-x-2 items-center">
          <Map16 />
          <p class="font-bold">{$pageContext.context.place.name}</p>
        </div>
        <a
          title="Abrir feed de la localidad"
          href={getAbsoluteURL({
            subdomain: $pageContext.context.place.slug,
          })}
          use:tooltip
          target="_blank"
          on:click|stopPropagation={() => {}}
        >
          <Launch16 class="flex" />
        </a>
      {:else}
        <div class="flex space-x-2 items-center">
          <Home16 class="opacity-50" />
          <p class="opacity-50 italic">Selecciona una localidad...</p>
        </div>
      {/if}
    </div>
  </div>
  <div
    class="flex flex-col font-bold space-y-3 text-xs text-gray-800 dark:text-white"
    class:w-full={fullWidth}
    class:items-end={!fullWidth}
    slot="body"
  >
    {#each $pageContext.context.places || [] as place}
      <a
        class="flex font-normal space-x-2 items-center disabled:cursor-not-allowed disabled:opacity-50 hover:not-disabled:underline"
        class:w-full={fullWidth}
        class:justify-between={fullWidth}
        href="/places/{place.slug}"
      >
        <span>{place.name}</span>
        <Map16 class="flex" />
      </a>
    {/each}
    {#if $pageContext.context.places?.length}
      <a
        class="flex font-bold space-x-2 items-center disabled:cursor-not-allowed disabled:opacity-50 hover:not-disabled:underline"
        class:w-full={fullWidth}
        class:justify-between={fullWidth}
        href="/"
      >
        <span>Todas las localidades</span>
        <OverflowMenuVertical16 class="flex" />
      </a>
    {/if}
    <a
      class="flex font-bold space-x-2 items-center disabled:cursor-not-allowed disabled:opacity-50 hover:not-disabled:underline"
      class:w-full={fullWidth}
      class:justify-between={fullWidth}
      href="/places/new"
    >
      <span>Nueva localidad</span>
      <Add16 class="flex" />
    </a>
  </div>
</Submenu>
