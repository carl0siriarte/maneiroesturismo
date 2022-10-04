<script>
  import { page } from '$app/stores'
  import { createPageContextStore, pageContext } from '$lib'
  import { tooltip } from '$lib/components/tooltip'
  import { Image16, Image32, Map24 } from 'carbon-icons-svelte'
  import { setContext } from 'svelte'
  import { expoOut } from 'svelte/easing'
  import { fade } from 'svelte/transition'
  import Information from './Information.svelte'
  import { feedPages, getFeedPageIcon } from './pages'
  import Posts from './Posts.svelte'

  export let spa = false

  $: feedPage =
    (spa ? $page.url.searchParams.get('feed') : $page.params.feedPage) || ''

  export let editable = false

  setContext(
    'placeData',
    createPageContextStore({
      place: $pageContext.context.place || undefined,
      editable,
      initialState: $pageContext.context.placeData,
    })
  )
</script>

<div
  class="bg-gradient-to-br flex from-purple-800 to-sky-300 h-40vh w-full p-4 relative lg:px-[20%] dark:(from-cool-gray-600 to-cool-gray-900) "
>
  {#if editable}
    <div class="flex h-full w-full relative">
      <button
        use:tooltip
        title="Cambiar fondo"
        class="rounded-full bg-gray-100 shadow-lg opacity-75 p-2 right-0 bottom-0 text-dark-900 duration-200 absolute hover:opacity-100"
      >
        <Image16 />
      </button>
    </div>
  {/if}
</div>

<div class="flex flex-col space-y-8 w-full p-4 relative lg:px-[20%]">
  <div class="flex flex-col space-y-6 w-full">
    <div class="flex w-full justify-between">
      <div
        class="rounded-full flex bg-gray-100 border-2 border-gray-300 shadow-lg -mt-14 min-h-24 min-w-24 items-center justify-center dark:bg-dark-400 dark:border-dark-100"
        title="Cambiar imagen"
        use:tooltip
      >
        <Image32 />
      </div>
      <div class="flex space-x-4 items-center">
        {#each feedPages as link}
          {@const active = feedPage == link.id}
          <a
            class="border-transparent flex space-x-2 border-b-2 pb-1 duration-200 items-center hover:border-current"
            class:border-current={active}
            href="{spa ? '?feed=' : '/'}{link.id}"
          >
            <svelte:component this={getFeedPageIcon(link.id)} />
            <span class="flex font-bold text-xs">{link.title}</span>
          </a>
        {/each}
      </div>
    </div>
    <div class="flex space-x-4 mb-8 w-full items-center">
      <Map24 />
      <h2 class="font-bold font-title text-black text-2xl dark:text-white ">
        {$pageContext.context.place?.name}
      </h2>
    </div>
  </div>
  {#key feedPage}
    <div
      class="flex flex-col w-full"
      in:fade={{ duration: 600, easing: expoOut }}
    >
      {#if feedPage == 'information'}
        <Information {editable} />
      {:else}
        <Posts {editable} />
      {/if}
    </div>
  {/key}
</div>
