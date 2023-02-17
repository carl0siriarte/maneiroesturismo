<script lang="ts">
  import { page as app } from '$app/stores'
  import { browser } from '$app/environment'
  import { tooltip } from '$lib/components/tooltip'
  import { pageContext } from '$lib/stores'
  import { trpc } from '$lib/trpc/client'
  import type { Post } from '@pkg/db'
  import type { RouterTypes } from '@pkg/trpc'
  import { ArrowDown24, Road24 } from 'carbon-icons-svelte'
  import { onMount, tick } from 'svelte'
  import { expoOut } from 'svelte/easing'
  import { fly } from 'svelte/transition'
  import PostCard from './PostCard.svelte'

  export let page = 2

  export let data: RouterTypes['posts']['list']['output'] | undefined =
    undefined
  let fetching = false

  export let pageSize = 10
  export let filter = ''

  let waitTimeout: NodeJS.Timeout

  $: $app.url.searchParams.get('user'), search(filter)

  function search(_filter: string) {
    if (!browser) return
    if (data) {
      page = 0
      data = undefined
      fetchData()
    }
  }

  async function fetchData() {
    waitTimeout = setTimeout(() => {
      fetching = true
      tick()
    }, 100)
    page = page + 1
    const newData = await trpc.posts.list.query({
      placeId: $pageContext.context.place?.id || '',
      authorId: $app.url.searchParams.get('user') || undefined,
      pageSize,
      filter,
      page,
    })
    const merged = [...(data?.items || []), ...newData.items]
    // const unique = new Set(merged.map(i => i.id))
    data = {
      count: newData.count,
      items: merged,
    }
    clearTimeout(waitTimeout)
    fetching = false
  }

  export function pushPost(post: Post) {
    data = {
      count: (data?.count || 0) + 1,
      items: [
        {
          ...post,
          _count: {
            CommentOnPost: 0,
            likes: 0,
          },
          liked: false,
          author: null,
        },
        ...(data?.items || []),
      ],
    }
  }

  onMount(() => {
    if (!data) {
      page = 0
      fetchData()
    }
  })
</script>

<div class="flex flex-col w-full relative">
  <div />

  <div class="flex flex-col space-y-8 w-full">
    {#if data}
      {#each data.items as post (post.id)}
        <div
          class="flex flex-col w-full"
          in:fly|local={{ duration: 400, y: 5, easing: expoOut }}
        >
          <PostCard {post} />
        </div>
      {/each}
    {/if}
    {#if fetching || !data}
      {#each Array.from({ length: pageSize }) as _}
        <div
          class="flex flex-col w-full"
          in:fly|local={{ duration: 400, y: 5, easing: expoOut }}
        >
          <PostCard />
        </div>
      {/each}
    {/if}
    {#if data?.items.length != data?.count}
      <div class="flex w-full justify-center">
        <button
          class="flex flex-col space-y-2 text-gray-500 duration-100 items-center justify-center hover:text-dark-900 hover:underline dark:hover:text-white"
          title="Cargar más publicaciones"
          use:tooltip
          on:click={fetchData}
        >
          <span class="text-xs">Cargar más</span>
          <ArrowDown24 />
        </button>
      </div>
    {:else if !fetching && data}
      <div
        class="flex flex-col space-y-2 w-full text-gray-500 justify-center items-center"
      >
        <p class="text-xs text-center">Eso es todo</p>
        <Road24 />
      </div>
    {/if}
  </div>
</div>
