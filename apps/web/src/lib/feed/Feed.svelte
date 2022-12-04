<script lang="ts">
  import { browser } from '$app/environment'
  import { goto, invalidateAll } from '$app/navigation'
  import { page } from '$app/stores'
  import { createPageContextStore, pageContext } from '$lib'
  import Image from '$lib/components/caravaggio/Image.svelte'
  import { useCaravaggioBuilder } from '$lib/components/caravaggio/useCaravaggio'
  import { tooltip } from '$lib/components/tooltip'
  import { trpc } from '$lib/trpc/client'
  import type { Post, User } from '@pkg/db'
  import { supabase } from '@pkg/shared'
  import type { RouterTypes } from '@pkg/trpc'
  import {
    ChevronDown24,
    Close16,
    EventSchedule16,
    Home16,
    Image16,
    Image32,
    Information16,
    Map16,
    Map24,
    Search16,
    Renew16,
    Close24,
  } from 'carbon-icons-svelte'
  import { createEventDispatcher, onMount, setContext } from 'svelte'
  import { portal } from 'svelte-portal'
  import { backOut, expoOut } from 'svelte/easing'
  import { fade, fly, scale } from 'svelte/transition'
  import Events from './Events.svelte'
  import Information from './Information.svelte'
  import { feedPages } from './pages'
  import PostCard from './PostCard.svelte'
  import PostEditor from './PostEditor.svelte'
  import Posts from './Posts.svelte'

  export let spa = false
  export let post: RouterTypes['posts']['get']['output'] & {
    thumbnail?: string
  }

  $: feedPage =
    (spa ? $page.url.searchParams.get('feed') : $page.params.feedPage) || ''

  /** @param {string | import('.').FeedPageId} id */
  function getFeedPageIcon(id) {
    if (id == 'events') {
      return EventSchedule16
    } else if (id == 'information') {
      return Information16
    } else {
      return Home16
    }
  }

  export let editable = false

  setContext(
    'placeData',
    createPageContextStore({
      place: $pageContext.context.place || undefined,
      editable,
      initialState: $pageContext.context.placeData,
    })
  )

  let search = ''
  let searchTerm = ''

  let scrollY = 0
  let coverHeight = 0

  let showControls = false

  let pushPost: (post: Post) => void | undefined

  type Events = {
    closePostModal: void
  }

  let mounted = false
  onMount(() => {
    mounted = true
  })

  let user: User | undefined

  $: userId = $page.url.searchParams.get('user')
  $: userId, fetchUser()

  async function fetchUser() {
    switch (userId) {
      case null:
        user = undefined
        break
      default:
        const members = await trpc.places.members.query({
          ids: [userId],
          placeId: $pageContext.context.place?.id || '',
        })
        user = members.count ? members.items[0] : undefined
    }
  }

  const dispatcher = createEventDispatcher<Events>()
  $: nonFilteredUrl = () => {
    const query = new URLSearchParams($page.url.searchParams)
    query.delete('user')
    return (
      $page.url.pathname + (query.entries.length ? '?' + query.toString() : '')
    )
  }

  let uploadingBg = false
  let uploadingLogo = false
  $: uploadImage = async (event) => {
    try {
      if (
        !event.currentTarget.files ||
        event.currentTarget.files.length === 0
      ) {
        throw new Error('You must select an image to upload.')
      }
      const file = event.currentTarget.files[0]
      uploadingBg = true
      const { url, path } = await supabase.uploadFile({
        file,
        bucket: 'assets',
        path: `/element-assets/images`,
      })
      return { url, path }
    } catch (error) {
      alert(error.message)
      return { url: '', path: '' }
    } finally {
      uploadingBg = false
    }
  }

  $: coverImage = $pageContext.context.place?.coverImage || ''
  $: logoImage = $pageContext.context.place?.logo || ''

  async function setBgImage(url: string) {
    await trpc.places.update.mutate({
      id: $pageContext.context.place?.id || '',
      coverImage: url,
    })
    // coverImage = url
    pageContext.update((data) => {
      data.context.place!.coverImage = url
      return data
    })
    invalidateAll()
  }

  async function setLogoImage(url: string) {
    await trpc.places.update.mutate({
      id: $pageContext.context.place?.id || '',
      logo: url,
    })
    // logoImage = url
    invalidateAll()
    pageContext.update((data) => {
      data.context.place!.logo = url
      return data
    })
  }
</script>

<svelte:window bind:scrollY />

{#if coverImage}
  <div
    class="bg-gradient-to-br bg-center bg-cover flex from-green-800 to-sky-600 h-40vh w-full p-4 relative lg:px-[20%] dark:(from-cool-gray-600 to-cool-gray-900) "
    bind:clientHeight={coverHeight}
    style="background-image: url({useCaravaggioBuilder()(coverImage, {
      rs: {
        s: '800x',
      },
    })})"
  >
    {#if editable}
      <div class="flex h-full w-full relative">
        <input
          type="file"
          name=""
          class="h-0 opacity-0 top-0 w-0 hidden absolute"
          accept="image/*"
          use:portal
          id="logo-input"
          on:change={async (e) => {
            uploadingLogo = true
            try {
              const { url } = await uploadImage(e)
              // @ts-ignore
              e.target.value = ''
              if (url) {
                setLogoImage(url)
              }
            } catch (err) {
              console.log(err)
            } finally {
              uploadingLogo = false
            }
          }}
        />
        <input
          type="file"
          name=""
          class="h-0 opacity-0 top-0 w-0 hidden absolute"
          accept="image/*"
          use:portal
          id="cover-input"
          on:change={async (e) => {
            uploadingBg = true
            try {
              const { url } = await uploadImage(e)
              console.log(e)
              // @ts-ignore
              e.target.value = ''
              if (url) {
                setBgImage(url)
              }
            } catch (err) {
              console.log(err)
            } finally {
              uploadingBg = false
            }
          }}
        />
        <button
          use:tooltip
          title="Cambiar fondo"
          class="rounded-full bg-gray-100 shadow-lg opacity-75 p-2 right-0 bottom-0 text-dark-900 duration-200 absolute hover:opacity-100"
          disabled={uploadingBg}
          on:click={() => {
            if (typeof document === 'undefined') return
            document.getElementById('cover-input')?.click()
          }}
        >
          <Renew16 class={uploadingBg ? 'animate-spin' : ''} />
        </button>
      </div>
    {/if}
  </div>
{:else}
  <div
    class="bg-gradient-to-br bg-center bg-cover flex from-green-800 to-sky-600 h-40vh w-full p-4 relative lg:px-[20%] dark:(from-cool-gray-600 to-cool-gray-900) "
    bind:clientHeight={coverHeight}
  >
    {#if editable}
      <div class="flex h-full w-full relative">
        <input
          type="file"
          name=""
          class="h-0 opacity-0 top-0 w-0 hidden absolute"
          accept="image/*"
          use:portal
          id="logo-input"
          on:change={async (e) => {
            uploadingLogo = true
            try {
              const { url } = await uploadImage(e)
              // @ts-ignore
              e.target.value = ''
              if (url) {
                setLogoImage(url)
              }
            } catch (err) {
              console.log(err)
            } finally {
              uploadingLogo = false
            }
          }}
        />
        <input
          type="file"
          name=""
          class="h-0 opacity-0 top-0 w-0 hidden absolute"
          accept="image/*"
          use:portal
          id="cover-input"
          on:change={async (e) => {
            uploadingBg = true
            try {
              const { url } = await uploadImage(e)
              console.log(e)
              // @ts-ignore
              e.target.value = ''
              if (url) {
                setBgImage(url)
              }
            } catch (err) {
              console.log(err)
            } finally {
              uploadingBg = false
            }
          }}
        />
        <button
          use:tooltip
          title="Cambiar fondo"
          class="rounded-full bg-gray-100 shadow-lg opacity-75 p-2 right-0 bottom-0 text-dark-900 duration-200 absolute hover:opacity-100"
          disabled={uploadingBg}
          on:click={() => {
            if (typeof document === 'undefined') return
            document.getElementById('cover-input')?.click()
          }}
        >
          <Renew16 class={uploadingBg ? 'animate-spin' : ''} />
        </button>
      </div>
    {/if}
  </div>
{/if}

{#if post}
  <div
    class="flex h-full w-full top-0 z-99 fixed items-center justify-center backdrop-filter backdrop-blur-md"
    transition:fade|local={{ duration: 400, easing: expoOut }}
    use:portal
  >
    <div
      class="bg-black h-full w-full opacity-40 absolute"
      on:click={() => dispatcher('closePostModal')}
    />
    <div
      class="flex flex-col h-full space-y-2 min-w-5/10 w-full max-w-9/10 max-h-[90vh] relative items-center justify-center pointer-events-none lg:max-w-9/10"
      in:fly|local={{ y: 20, duration: 400, easing: backOut }}
      out:scale|local={{ start: 0.2, duration: 200, easing: expoOut }}
    >
      <PostCard
        on:close={() => dispatcher('closePostModal')}
        {post}
        noAnimate
        alt
      />
    </div>
  </div>
{/if}

<div class="flex flex-col space-y-6 w-full relative">
  <div
    class="flex flex-col top-[calc(var(--header-height))] w-full pb-0 z-20"
    class:fixed={scrollY >= coverHeight && browser}
  >
    {#if mounted}
      <div
        class="flex bg-gray-100 h-[calc(100%)] w-full absolute backdrop-blur-md backdrop-filter  !bg-opacity-75 dark:bg-dark-800"
        class:hidden={scrollY < coverHeight}
      />
    {/if}
    <div class="min-h-38px px-4 pt-4 relative lg:px-[20%]">
      <div
        class="flex w-full pb-4 relative items-start justify-end"
        class:!lg:justify-between={scrollY >= coverHeight}
      >
        {#if scrollY < coverHeight}
          <div
            class="rounded-full flex bg-gray-100 border-2 border-gray-300 shadow-lg -mt-18 min-h-24 min-w-24 transform origin-top-left left-0 duration-200 absolute items-center justify-center dark:bg-dark-400 dark:border-dark-100 "
            class:max-w-24={logoImage}
            class:max-h-24={logoImage}
            style="will-change: width, height"
            class:!min-h-16={scrollY >= coverHeight}
            class:!min-w-16={scrollY >= coverHeight}
            class:!h-16={scrollY >= coverHeight}
            class:!w-16={scrollY >= coverHeight}
          >
            {#if !logoImage}
              <Image32 />
            {:else}
              <Image
                src={logoImage}
                class="rounded-full"
                options={{
                  o: 'png',
                  rs: {
                    s: '200x200',
                    m: 'fill',
                    b: '000000.0',
                  },
                }}
              />
            {/if}
            {#if editable}
              <button
                use:tooltip
                title="Cambiar imagen"
                disabled={uploadingLogo}
                class="rounded-full bg-gray-100 shadow-lg opacity-75 p-2 -top-2 -right-2 text-dark-900 duration-200 absolute hover:opacity-100"
                on:click={() => {
                  if (typeof document === 'undefined') return
                  document.getElementById('logo-input')?.click()
                }}
              >
                <Renew16 class={uploadingLogo ? 'animate-spin' : ''} />
              </button>
            {/if}
          </div>
        {:else}
          <div
            class="flex space-x-2 w-full items-center"
            in:fly={{ y: 10, duration: 200 }}
          >
            <Map16 />
            <h2
              class="font-bold font-title text-black text-xs dark:text-white "
            >
              {$pageContext.context.place?.name}
            </h2>
          </div>
        {/if}
        <div class="flex space-x-4 items-center">
          {#each feedPages as link}
            {@const active = feedPage == link.id}
            <a
              class="border-transparent flex space-x-2 border-b-2 pb-1 duration-200 items-center hover:border-current"
              class:border-current={active}
              href="{spa ? '?feed=' : '/'}{link.id}"
            >
              {#if getFeedPageIcon(link.id)}
                <svelte:component this={getFeedPageIcon(link.id)} />
              {/if}
              <span class="flex font-bold text-xs">{link.title}</span>
            </a>
          {/each}
        </div>
      </div>
      <div
        class="border-b flex flex-col space-y-6 border-gray-300 pb-4 top-[calc(var(--header-height)+56px)] z-20  sticky dark:border-dark-100"
      >
        <div
          class="flex w-full justify-between <lg:flex-col <lg:space-y-4"
          class:!justify-between={scrollY < coverHeight}
        >
          {#if scrollY < coverHeight}
            <div class="flex space-x-4 w-full items-center">
              <Map24 />
              <h2
                class="font-bold font-title text-black text-2xl dark:text-white "
              >
                {$pageContext.context.place?.name}
              </h2>
            </div>
          {/if}
          {#if feedPage != 'information'}
            <form
              class="w-full relative"
              on:submit|preventDefault={() => {
                searchTerm = search
              }}
            >
              <div
                class="flex space-x-2 w-full px-3 inset-0 absolute pointer-events-none items-center justify-end"
              >
                {#if search}
                  <button
                    type="button"
                    class="pointer-events-auto"
                    title="Limpiar búsqueda"
                    transition:fly={{ y: 2, duration: 200 }}
                    use:tooltip
                    on:click={() => {
                      searchTerm = ''
                      search = ''
                    }}
                  >
                    <Close16 />
                  </button>
                {/if}
                <button
                  type="submit"
                  class="pointer-events-auto"
                  title="Realizar búsqueda"
                  class:opacity-50={!search}
                  use:tooltip
                >
                  <Search16 />
                </button>
              </div>
              <input
                class="bg-white border rounded border-gray-300 text-xs leading-tight w-full py-2 px-3 pr-[calc(24px+24px+16px)] appearance-none dark:bg-dark-700 dark:border-dark-400 focus:outline-none focus:shadow-outline disabled:bg-gray-200 disabled:text-gray-500 disabled:dark:bg-dark-900"
                type="text"
                autocomplete="nooooope"
                aria-autocomplete="none"
                placeholder="Buscar..."
                bind:value={search}
              />
            </form>
          {/if}
        </div>
        {#if userId && feedPage != 'information'}
          <div class="flex w-full items-center justify-between">
            <div class="flex flex-col space-y-2">
              <div class="flex space-x-4 items-center">
                <div
                  class="bg-gradient-to-br border rounded-full cursor-pointer flex font-bold font-title from-green-300 to-sky-800 border-gray-200 h-32px text-white text-xs leading-[0] w-32px items-center justify-center uppercase dark:bg-gray-600 dark:from-green-400 dark:to-sky-900"
                >
                  {user?.name?.[0] || '...'}
                </div>
                <div class="flex flex-col">
                  <h2 class="font-bold text-xs">Filtrando resultados</h2>
                  <h4 class="font-bold text-black text-xs dark:text-white ">
                    {user?.name || 'Cargando...'}
                  </h4>
                </div>
              </div>
            </div>
            <a
              class="flex transform transition-transform duration-200 hover:scale-90"
              href={nonFilteredUrl()}
            >
              <Close24 />
            </a>
          </div>
        {:else if editable && feedPage == ''}
          {#if scrollY < coverHeight || showControls}
            <div class="flex flex-col w-full" in:fade|local={{ duration: 200 }}>
              <PostEditor
                on:create={({ detail }) => {
                  pushPost?.(detail)
                }}
              />
            </div>
          {/if}
          {#if scrollY >= coverHeight}
            <button
              class="mx-auto transform text-gray-400 hover:text-dark-900 dark:hover:text-gray-100"
              title="Mostrar/ocultar controles"
              use:tooltip
              class:rotate-180={showControls}
              on:click={() => (showControls = !showControls)}
            >
              <ChevronDown24 />
            </button>
          {/if}
        {/if}
      </div>
    </div>
  </div>
  {#key feedPage}
    <div
      class="flex flex-col w-full px-4 pb-16 lg:px-[20%]"
      in:fade={{ duration: 600, easing: expoOut }}
      class:pt-152px={scrollY >= coverHeight && mounted}
      class:!lg:pt-104px={scrollY >= coverHeight && mounted}
      class:!pt-282px={scrollY >= coverHeight &&
        editable &&
        feedPage == '' &&
        mounted}
      class:!lg:pt-234px={scrollY >= coverHeight &&
        editable &&
        feedPage == '' &&
        mounted}
    >
      {#if feedPage == 'information'}
        <Information {editable} />
      {:else if feedPage == 'events'}
        <Events />
      {:else}
        <Posts bind:pushPost bind:filter={searchTerm} />
      {/if}
    </div>
  {/key}
</div>
