<svelte:options immutable />

<script lang="ts">
  import { tooltip } from '$lib/components/tooltip'
  import { pageContext } from '$lib/stores'
  import { getAbsoluteURL } from '$lib/utils/host'
  import type { Post } from '@pkg/db'
  import {
    AddComment24,
    Favorite24,
    Image16,
    Share24,
  } from 'carbon-icons-svelte'

  export let post: Post | undefined = undefined
</script>

<div class="flex flex-col space-y-4">
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
  {#if post}
    <div
      class="bg-white border rounded-lg flex flex-col border-gray-300 w-full overflow-hidden dark:bg-dark-400 dark:border-dark-100"
    >
      <div class="flex text-block text-sm p-2">
        {@html post.content}
      </div>
      <div
        class="border-t flex divide-x-1 divide-gray-300 border-gray-300 w-full text-gray-400 dark:divide-dark-100 dark:border-dark-100"
      >
        <button
          class="flex space-x-2 p-2 w-1/3 duration-100 items-center justify-center hover:text-pink-500"
          title={'Agregar "Me gusta"'}
          use:tooltip
        >
          <Favorite24 class="flex" />
          <span class="font-bold text-xs">0</span>
        </button>
        <a
          class="flex space-x-2 p-2 w-1/3 duration-100 items-center justify-center hover:text-dark-900 dark:hover:text-gray-100"
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
        <button
          class="flex p-2 w-1/3 duration-100 items-center justify-center hover:text-dark-900 dark:hover:text-gray-100"
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
</div>
