<script>
  import { page } from '$app/stores'
  import Submenu from '$lib/components/Submenu.svelte'
  import { tooltip } from '$lib/components/tooltip'
  import Logo from '$lib/Logo.svelte'

  import { pageContext, preferences } from '$lib/stores'
  import { api } from '@pkg/shared'
  import {
    Logout16,
    Moon24,
    Settings16,
    Sun24,
    Home16,
    UserMultiple16,
    Forum16,
    ReportData16,
  } from 'carbon-icons-svelte'
  import { expoOut } from 'svelte/easing'
  import { slide } from 'svelte/transition'
  import PlaceDropdown from './PlaceDropdown.svelte'

  /** @type {import('@pkg/db').User} */
  $: user = $page.data.user

  const placeLinks = [
    {
      href: '',
      icon: Home16,
      title: 'Feed',
    },
    {
      href: '/members',
      icon: UserMultiple16,
      title: 'Miembros',
    },
    {
      href: '/contact',
      icon: Forum16,
      title: 'Contacto',
    },
    {
      href: '/settings',
      icon: ReportData16,
      title: 'Reportes',
    },
    {
      href: '/settings',
      icon: Settings16,
      title: 'Configuración',
    },
  ]

  export let headerHeight = 0
</script>

<header bind:clientHeight={headerHeight}>
  <div class="dock">
    <a href="/" class="flex transform duration-200 hover:scale-98">
      <Logo />
    </a>
    <div class="flex space-x-4 items-center">
      <div class="<sm:hidden">
        <PlaceDropdown />
      </div>
      <Submenu>
        <div class="content" slot="button">
          <div
            class="bg-gradient-to-br border rounded-full cursor-pointer flex font-bold font-title from-green-300 to-sky-800 border-gray-200 h-32px text-white text-xs leading-[0] w-32px items-center justify-center uppercase dark:bg-gray-600 dark:from-green-400 dark:to-sky-900"
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
        class="flex text-gray-400 relative hover:text-black dark:hover:text-white"
        title="Cambiar tema"
        use:tooltip
        style="width: 24px; height: 24px"
      >
        <div class="top-0 left-0 absolute pointer-events-none">
          <svelte:component this={$preferences.darkMode ? Moon24 : Sun24} />
        </div>
      </button>
    </div>
  </div>
  <div class="flex flex-col w-full sm:hidden">
    <PlaceDropdown fullWidth />
  </div>
  {#if $pageContext.context.place}
    <div
      class="flex flex-nowrap space-x-4 -mb-3 overflow-auto whitespace-nowrap no-scrollbar"
      transition:slide|local={{ duration: 200, easing: expoOut }}
    >
      {#each placeLinks as link}
        {@const href = `/places/${$pageContext.context.place.slug}${link.href}`}
        {@const active = !link.href
          ? $page.url.pathname == href
          : $page.url.pathname.startsWith(href)}
        <a
          {href}
          class="border-transparent flex font-bold space-x-2 border-b-2 text-sm text-xs pb-1 duration-200 items-center hover:border-current"
          class:border-current={active}
        >
          {#if link.icon}
            <svelte:component this={link.icon} />
          {/if}
          <span>{link.title}</span>
        </a>
      {/each}
    </div>
  {/if}
</header>

<style>
  header {
    @apply flex flex-col space-y-3 bg-gray-100 bg-opacity-75 w-full p-3 top-0 left-0 z-80 sticky backdrop-filter backdrop-blur-lg;
    @apply border-b border-gray-300;
  }

  @screen lg {
    header {
      @apply px-5/100;
    }
  }

  .dock {
    @apply flex w-full justify-between;
  }

  :global(.dark) header {
    @apply bg-dark-800 bg-opacity-50;
  }

  :global(.dark) header {
    @apply border-dark-100;
  }
</style>
