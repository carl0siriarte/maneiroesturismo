<script lang="ts">
  import { invalidateAll } from '$app/navigation'
  import { tooltip } from '$lib/components/tooltip'
  import { user } from '$lib/stores'
  import { trpc } from '$lib/trpc/client'
  import type { Comment } from '@pkg/db'
  import type { RouterTypes } from '@pkg/trpc'
  import { AddComment16, ArrowDown16, Reply16 } from 'carbon-icons-svelte'
  import { onMount, tick } from 'svelte'
  import { expoOut } from 'svelte/easing'
  import { fly, slide } from 'svelte/transition'
  import CommentaryEditor from './CommentaryEditor.svelte'

  export let postId: string
  export let replyToId: string | undefined = undefined
  export let page = 2

  export let data: RouterTypes['comments']['list']['output'] | undefined =
    undefined
  let fetching = false

  export let pageSize = 3

  let waitTimeout: NodeJS.Timeout

  async function fetchData() {
    waitTimeout = setTimeout(() => {
      fetching = true
      tick()
    }, 100)
    page = page + 1
    const newData = await trpc.comments.list.query({
      originId: replyToId || postId,
      origin: replyToId ? 'comment' : 'post',
      pageSize,
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

  export function pushComment(comment: Comment) {
    data = {
      count: (data?.count || 0) + 1,
      items: [
        {
          ...comment,
          _count: {
            replies: 0,
          },
        },
        ...(data?.items || []),
      ],
    }
    invalidateAll()
    console.log('Invalidating')
  }

  let replyTo: string | undefined
  let viewingReplies: Record<string, boolean> = {}
  let pushers: Record<string, typeof pushComment | undefined> = {}

  onMount(() => {
    if (!data) {
      page = 0
      fetchData()
    }
  })
</script>

<div
  class="flex flex-col space-y-2 border-gray-300 w-full relative dark:border-dark-100"
>
  {#if $user && !replyToId}
    <CommentaryEditor
      {postId}
      on:create={({ detail }) => pushComment(detail)}
    />
  {/if}
  <div class="flex flex-col w-full">
    {#if data}
      {#each data.items as comment, idx (comment.id)}
        <div
          class="border-t border-dashed flex flex-col space-y-2 border-gray-300 w-full pt-2 dark:border-dark-100"
          class:pb-2={idx < data.count - 1 && data.count > 1}
          in:fly|local={{ duration: 400, y: 5, easing: expoOut }}
        >
          <div class="flex space-x-2 items-center">
            <div class="flex flex-col space-y-1">
              <h4 class="text-black text-xs dark:text-white ">
                <strong>
                  {comment.author?.name}
                </strong>
              </h4>
            </div>
          </div>
          <p class="text-xs">{comment.content}</p>
          <div class="flex w-full justify-between">
            <div class="text-xs text-gray-500">
              {comment.createdAt.toLocaleString()}
            </div>
            <div class="flex space-x-3">
              {#if !viewingReplies[comment.id] && comment._count.replies}
                <button
                  class="flex ml-auto space-x-1 text-xs text-blue-500 items-center group"
                  on:click={() => (viewingReplies[comment.id] = true)}
                >
                  <span class="group-hover:underline"
                    >Ver {comment._count.replies} respuestas</span
                  >
                  <AddComment16 class="h-12px w-12px" />
                </button>
              {/if}
              {#if $user}
                <button
                  class="flex space-x-1 text-xs text-gray-500 items-center group"
                  class:!text-red-500={replyTo == comment.id}
                  on:click={() => (replyTo = replyTo ? undefined : comment.id)}
                >
                  <span class="group-hover:underline"
                    >{replyTo == comment.id ? 'Cancelar' : 'Responder'}</span
                  >
                  <Reply16 class="h-12px w-12px" />
                </button>
              {/if}
            </div>
          </div>
          {#if replyTo == comment.id}
            <div transition:slide={{ duration: 200 }}>
              <CommentaryEditor
                {postId}
                replyToId={comment.id}
                on:create={({ detail }) => {
                  pushers[comment.id]?.(detail)
                  viewingReplies[comment.id] = true
                  replyTo = undefined
                  invalidateAll()
                }}
              />
            </div>
          {/if}
          {#if viewingReplies[comment.id]}
            <div
              class="border-l border-dashed border-gray-300 pl-2 dark:border-dark-100"
            >
              <svelte:self
                {postId}
                replyToId={comment.id}
                bind:pushComment={pushers[comment.id]}
              />
            </div>
          {/if}
        </div>
      {/each}
    {/if}
    {#if fetching || !data}
      <!-- {#each Array.from({ length: pageSize }) as _} -->
      <div
        class="flex w-full p-2"
        in:fly|local={{ duration: 400, y: 5, easing: expoOut }}
      >
        <div class="rounded h-64px w-full skeleton" />
      </div>
      <!-- {/each} -->
    {/if}
    {#if data?.items.length != data?.count}
      <div class="flex w-full pt-2 justify-center">
        <button
          class="flex flex-col space-y-2 text-gray-500 duration-100 items-center justify-center hover:text-dark-900 hover:underline dark:hover:text-white"
          title="Ver más comentarios"
          use:tooltip
          on:click={fetchData}
        >
          <span class="text-xs">Cargar más</span>
          <ArrowDown16 />
        </button>
      </div>
    {/if}
  </div>
</div>
