<svelte:options immutable />

<script lang="ts">
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  import Submenu from '$lib/components/Submenu.svelte'
  import { tooltip } from '$lib/components/tooltip'
  import Viewport from '$lib/components/Viewport.svelte'
  import { pageContext, user } from '$lib/stores'
  import { trpc } from '$lib/trpc/client'
  import { getAbsoluteURL } from '$lib/utils/host'
  import type { Post } from '@pkg/db'
  import {
    AddComment24,
    Close24,
    Favorite24,
    FavoriteFilled24,
    Image16,
    Link16,
    LogoFacebook16,
    LogoTwitter16,
    Share24,
  } from 'carbon-icons-svelte'
  import { createEventDispatcher } from 'svelte'
  import Commentaries from './Commentaries.svelte'

  export let post:
    | (Post & {
        _count?: {
          CommentOnPost?: number
          likes?: number
        }
        liked?: boolean
      })
    | undefined = undefined
  export let alt = false

  export let noAnimate = false
  const dispatcher = createEventDispatcher<{ close: void }>()
</script>

<Viewport
  class="flex flex-col space-y-4 {alt
    ? `!max-h-[95vh] ${!post?.thumbnail ? 'min-w-5/10' : 'w-full'}`
    : 'w-full'} anim !pointer-events-auto"
  once
  oneWay
  --a-t="600ms"
  --a-s="0.99"
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
      class="bg-white border rounded-lg flex border-gray-300 w-full dark:bg-dark-400 dark:border-dark-100"
      class:flex-col={!alt}
      class:!max-h-[90vh]={alt}
    >
      {#if post.thumbnail}
        <div
          class="border-[inherit] flex w-full aspect-square"
          class:border-b={!alt}
          class:border-r={alt}
          class:lg:w-[50%]={alt}
        />
      {/if}
      <div
        class="flex flex-col w-full"
        class:lg:w-[50%]={alt && post.thumbnail}
      >
        <div class="flex flex-col flex-grow text-block text-sm p-2">
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
          <div
            class="flex flex-col w-full overflow-auto"
            class:max-h-[35vh]={alt}
          >
            {@html post.content}
          </div>
        </div>
        {#if alt && post}
          <div
            class="border-t flex flex-col space-y-4 border-gray-300 w-full py-2 px-2 overflow-auto dark:border-dark-100"
          >
            <h4 class="font-bold text-sm">
              {post._count?.CommentOnPost || 0} Comentarios
            </h4>
            <Commentaries postId={post.id} />
          </div>
        {/if}
        <div
          class="border-t flex divide-x-1 divide-gray-300 border-gray-300 w-full text-gray-400 kiosk dark:divide-dark-100 dark:border-dark-100"
          class:alt
        >
          <button
            class="flex space-x-2 p-2 duration-100 items-center justify-center hover:text-pink-500"
            class:!text-pink-500={post.liked}
            title={'Agregar "Me gusta"'}
            type="button"
            on:click={() => {
              if (!post) {
                return
              }
              if (!$user) {
                goto('/login')
                return
              }
              post = {
                ...post,
                _count: {
                  CommentOnPost: post._count?.CommentOnPost ?? 0,
                  likes: post.liked
                    ? (post._count?.likes || 0) - 1
                    : (post._count?.likes || 0) + 1,
                },
              }
              post.liked = !post.liked
              trpc.posts.likePost.mutate(post.id)
            }}
            use:tooltip
          >
            {#if post.liked}
              <FavoriteFilled24 class="flex" />
            {:else}
              <Favorite24 class="flex" />
            {/if}
            <span class="font-bold text-xs">{post._count?.likes || 0}</span>
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
                    path: `/posts/${post.id}`,
                  })}
            >
              <AddComment24 />
              <span class="font-bold text-xs"
                >{post._count?.CommentOnPost || 0}</span
              >
            </a>
          {/if}
          <Submenu y="top">
            <button
              slot="button"
              class="flex w-full p-2 z-90 duration-100 items-center justify-center hover:text-dark-900 dark:hover:text-gray-100"
            >
              <Share24 />
            </button>
            <div
              class="flex flex-col font-bold space-y-3 text-xs text-gray-800 items-end dark:text-white"
              slot="body"
            >
              <a
                class="flex font-bold space-x-2 items-center disabled:cursor-not-allowed disabled:opacity-50 hover:not-disabled:underline"
                target="_blank"
                href="https://www.facebook.com/sharer.php?u={encodeURIComponent(
                  getAbsoluteURL({
                    subdomain: $pageContext.context.place?.slug || '',
                    path: `/posts/${post?.id}`,
                  })
                )}"
              >
                <span>Compartir en Facebook</span>
                <LogoFacebook16 class="flex" />
              </a>
              <a
                class="flex font-bold space-x-2 items-center disabled:cursor-not-allowed disabled:opacity-50 hover:not-disabled:underline"
                target="_blank"
                href="https://twitter.com/intent/tweet?url={encodeURIComponent(
                  getAbsoluteURL({
                    subdomain: $pageContext.context.place?.slug || '',
                    path: `/posts/${post?.id}`,
                  })
                )}"
              >
                <span>Compartir en Twitter</span>
                <LogoTwitter16 class="flex" />
              </a>
              <button
                class="flex font-bold space-x-2 items-center disabled:cursor-not-allowed disabled:opacity-50 hover:not-disabled:underline"
                on:click={() => {
                  if (!browser) return
                  const link = getAbsoluteURL({
                    subdomain: $pageContext.context.place?.slug || '',
                    path: `/posts/${post?.id}`,
                  })
                  navigator.clipboard.writeText(link)
                }}
              >
                <span>Copiar link en portapapeles</span>
                <Link16 class="flex" />
              </button>
            </div></Submenu
          >
        </div>
      </div>
    </div>
  {:else}
    <div class="rounded-lg min-h-[30vh] w-full relative skeleton" />
  {/if}
</Viewport>

<style>
  .kiosk > :global(*) {
    @apply w-1/3;
  }

  .kiosk.alt > :global(*) {
    @apply w-1/2;
  }
</style>
