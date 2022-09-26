<script>
  import { page } from '$app/stores'
  import Submenu from '$lib/components/Submenu.svelte'
  import { tooltip } from '$lib/components/tooltip'

  import { pageContext, preferences } from '$lib/stores'
  import { api } from '@pkg/shared'
  import {
    Add16,
    ChevronRight16,
    Home16,
    Logout16,
    Moon24,
    OverflowMenuVertical16,
    Pedestrian24,
    Settings16,
    Sun24,
  } from 'carbon-icons-svelte'

  /** @type {import('@pkg/db').User} */
  $: user = $page.data.user
</script>

<header>
  <div class="flex space-x-4 items-center">
    <a href="/">
      <Pedestrian24 class="flex" />
    </a>
    <Submenu x="left">
      <div class="flex h-full content items-center" slot="button">
        <div
          class="border rounded cursor-pointer flex space-x-2 bg-gray-50 border-gray-300 text-xs p-2 items-center dark:bg-dark-500 dark:border-dark-100"
        >
          <Home16 class="opacity-50" />
          {#if $pageContext.context.place}
            <p class="italic">Selecciona un lugar...</p>
          {:else}
            <p class="opacity-50 italic">Selecciona una localidad...</p>
          {/if}
        </div>
      </div>
      <div
        class="flex flex-col font-bold space-y-3 text-xs text-gray-800 dark:text-white"
        slot="body"
      >
        {#each $pageContext.context.places || [] as place}
          <a
            class="flex font-normal space-x-2 items-center disabled:cursor-not-allowed disabled:opacity-50 hover:not-disabled:underline"
            href="/places/{place.slug}"
          >
            <ChevronRight16 class="flex" />
            <span>{place.name}</span></a
          >
        {/each}
        {#if $pageContext.context.places?.length}
          <a
            class="flex font-bold space-x-2 items-center disabled:cursor-not-allowed disabled:opacity-50 hover:not-disabled:underline"
            href="/"
          >
            <OverflowMenuVertical16 class="flex" />
            <span>Todas las localidades</span></a
          >
        {/if}
        <a
          class="flex font-bold space-x-2 items-center disabled:cursor-not-allowed disabled:opacity-50 hover:not-disabled:underline"
          href="/places/new"
        >
          <Add16 class="flex" />
          <span>Nueva localidad</span></a
        >
      </div>
    </Submenu>
  </div>
  <div class="flex space-x-4 items-center">
    <Submenu>
      <div class="content" slot="button">
        <div
          class="bg-gradient-to-br border rounded-full cursor-pointer flex font-bold font-title from-green-300 to-pink-600 border-gray-200 h-32px text-white text-xs leading-[0] w-32px items-center justify-center uppercase dark:bg-gray-600 dark:from-green-400 dark:to-pink-700"
        >
          {user.name[0]}
        </div>
      </div>
      <div
        class="flex flex-col font-bold space-y-3 text-xs text-gray-800 items-end dark:text-white"
        slot="body"
      >
        <p>Hola, {user.name.split(' ')[0]?.trim()}!</p>
        <a
          class="flex font-normal space-x-2 items-center disabled:cursor-not-allowed disabled:opacity-50 hover:not-disabled:underline"
          href="/account/settings"
        >
          <span>Cuenta</span> <Settings16 class="flex" /></a
        >
        <button
          class="flex space-x-2 items-center disabled:cursor-not-allowed disabled:opacity-50 hover:not-disabled:underline"
          on:click={() => {
            api.del('/api/auth', {}).then(() => {
              window.location.reload()
            })
          }}
          type="button"
        >
          <span>Cerrar sesión</span> <Logout16 class="flex" /></button
        >
      </div>
    </Submenu>
    <button
      on:click={() => ($preferences.darkMode = !$preferences.darkMode)}
      class="flex relative hover:text-black dark:hover:text-white"
      title="Cambiar tema"
      use:tooltip
      style="width: 24px; height: 24px"
    >
      <div class="top-0 left-0 absolute pointer-events-none">
        <svelte:component this={$preferences.darkMode ? Moon24 : Sun24} />
      </div>
    </button>
  </div>
</header>

<style>
  header {
    @apply flex bg-gray-100 bg-opacity-50 w-full p-3 top-0 left-0 justify-between sticky backdrop-filter backdrop-blur-lg;
    @apply border-b border-gray-300;
  }

  :global(.dark) header {
    @apply bg-dark-800 bg-opacity-50;
  }

  @screen lg {
    header {
      @apply px-5/100;
    }
  }

  :global(.dark) header {
    @apply border-dark-100;
  }
</style>
