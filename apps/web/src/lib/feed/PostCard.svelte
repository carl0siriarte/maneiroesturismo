<svelte:options immutable />

<script lang="ts">
  import { tooltip } from '$lib/components/tooltip'
  import Viewport from '$lib/components/Viewport.svelte'
  import { pageContext, user } from '$lib/stores'
  import { getAbsoluteURL } from '$lib/utils/host'
  import type { Post } from '@pkg/db'
  import {
    AddComment24,
    Close24,
    Favorite24,
    Image16,
    Share24,
  } from 'carbon-icons-svelte'
  import { createEventDispatcher } from 'svelte'
  import CommentaryEditor from './CommentaryEditor.svelte'
  import PostEditor from './PostEditor.svelte'

  export let post: Post | undefined = undefined
  export let alt = false
  export let noAnimate = false
  const dispatcher = createEventDispatcher<{ close: void }>()
</script>

<Viewport
  class="flex flex-col space-y-4 min-w-5/10 anim !pointer-events-auto"
  --a-t="600ms"
  --a-s="0.99"
  once
  oneWay
  animate={!noAnimate}
>
  {#if !alt}
    <div class="flex flex-col space-y-2">
      <div class="flex space-x-4 items-center">
        <div
          class="bg-white rounded-full flex border-2 border-gray-300 min-h-12 min-w-12 items-center justify-center dark:bg-dark-400 dark:border-dark-100"
        >
          <Image16 />
        </div>
        <h4 class="font-bold text-black text-sm dark:text-white ">
          {$pageContext.context.place?.name}
        </h4>
      </div>
      {#if post}
        <div class="text-xs text-gray-500">
          Publicado el {post.createdAt.toLocaleString()}
        </div>
      {/if}
    </div>
  {/if}
  {#if post}
    <div
      class="bg-white border rounded-lg flex flex-col border-gray-300 w-full overflow-hidden dark:bg-dark-400 dark:border-dark-100"
    >
      <div class="flex flex-col text-block text-sm p-2">
        {#if alt}
          <div class="flex mb-2 w-full justify-between">
            <div class="flex space-x-2 items-center">
              <div
                class="bg-white rounded-full flex border-2 border-gray-300 min-h-8 min-w-8 items-center justify-center dark:bg-dark-400 dark:border-dark-100"
              >
                <Image16 class="h-10px w-10px" />
              </div>
              <div class="flex flex-col space-y-1 mb-2">
                <h4 class="text-black text-xs dark:text-white ">
                  <strong>
                    {$pageContext.context.place?.name}
                  </strong>
                </h4>
                <div class="text-xs text-gray-500">
                  Publicado el {post.createdAt.toLocaleString()}
                </div>
              </div>
            </div>
            <button
              class="flex"
              on:click={() => dispatcher('close')}
              title="Cerrar"
              use:tooltip><Close24 class="flex" /></button
            >
          </div>
        {/if}
        {@html post.content}
      </div>
      {#if alt && post}
        <div
          class="border-t flex flex-col space-y-4 border-gray-300 w-full p-2 dark:border-dark-100"
        >
          <h4 class="font-bold text-sm">Comentarios</h4>
          {#if $user}
            <CommentaryEditor postId={post.id} />
          {/if}
        </div>
      {/if}
      <div
        class="border-t flex divide-x-1 divide-gray-300 border-gray-300 w-full text-gray-400 kiosk dark:divide-dark-100 dark:border-dark-100"
        class:alt
      >
        <button
          class="flex space-x-2 p-2 duration-100 items-center justify-center hover:text-pink-500"
          title={'Agregar "Me gusta"'}
          use:tooltip
        >
          <Favorite24 class="flex" />
          <span class="font-bold text-xs">0</span>
        </button>
        {#if !alt}
          <a
            class="flex space-x-2 p-2 duration-100 items-center justify-center hover:text-dark-900 dark:hover:text-gray-100"
            title={'Comentarios'}
            use:tooltip
            data-sveltekit-noscroll
            href={$pageContext.layout == 'app'
              ? `?post=${post.id}`
              : getAbsoluteURL({
                  subdomain: $pageContext.context.place?.slug || '',
                  path: `/feed/${post.id}`,
                })}
          >
            <AddComment24 />
            <span class="font-bold text-xs">0</span>
          </a>
        {/if}
        <button
          class="flex p-2 duration-100 items-center justify-center hover:text-dark-900 dark:hover:text-gray-100"
          title={'Compartir'}
          use:tooltip
        >
          <Share24 />
        </button>
      </div>
    </div>
  {:else}
    <div class="rounded-lg h-[30vh] w-full skeleton" />
  {/if}
</Viewport>

<style>
  .kiosk > * {
    @apply w-1/3;
  }

  .kiosk.alt > * {
    @apply w-1/2;
  }
</style>
