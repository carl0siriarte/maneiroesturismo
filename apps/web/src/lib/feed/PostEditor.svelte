<script lang="ts">
  import { tooltip } from '$lib/components/tooltip'
  import Editor from '$lib/editor/Editor.svelte'
  import { pageContext } from '$lib/stores'
  import { trpc } from '$lib/trpc/client'
  import type { Post } from '@pkg/db'
  import { Document16, Image24 } from 'carbon-icons-svelte'
  import { createEventDispatcher, tick } from 'svelte'

  let value = ''
  let count = 0
  let publishing = false

  const dispatch = createEventDispatcher<{ create: Post }>()

  async function publish() {
    if (!valid || publishing) return
    publishing = true
    try {
      const post = await trpc.posts.create.mutate({
        placeEventId: null,
        thumbnail: null,
        content: value,
        placeId: $pageContext.context.place?.id || '',
      })
      dispatch('create', post)
      value = ''
      await tick()
      instanceEditor?.()
      await tick()
    } finally {
      publishing = false
    }
  }

  const countLimit = 500

  $: valid = count && count <= countLimit
  let instanceEditor: (() => void) | undefined
</script>

<div class="flex flex-col space-y-2">
  <div class="flex font-bold space-x-2 text-xs pb-2 items-center">
    <Document16 class="flex" />
    <span>Redactar publicación</span>
  </div>
  <div class="space-y-2">
    <div
      class="bg-white border rounded border-gray-300 text-sm text-block max-h-[20vh] p-2 rouded overflow-auto dark:bg-dark-400 dark:border-dark-100"
    >
      <Editor bind:value bind:count bind:instanceEditor />
    </div>
    <div class="flex w-full justify-between items-center">
      <div
        class="font-bold text-xs text-gray-400 duration-100 animate-duration-800"
        class:!text-red-500={count > countLimit}
        class:animate-head-shake={count > countLimit}
      >
        {count}/500 caracteres
      </div>
      <div class="flex space-x-4 items-center">
        <button
          class="flex text-gray-400 relative hover:text-black dark:hover:text-white"
          title="Subir imagen"
          use:tooltip
        >
          <Image24 />
        </button>
        <button
          class="rounded font-bold ml-auto border-2 border-blue-500 text-xs py-1 px-2 text-blue-500 duration-200 disabled:cursor-not-allowed disabled:opacity-50 not-disabled:hover:bg-blue-500 not-disabled:hover:text-white"
          disabled={!valid || publishing}
          on:click={publish}>{publishing ? 'Publicando...' : 'Publicar'}</button
        >
      </div>
    </div>
  </div>
</div>

<style>
  .text-block :global(a) {
    @apply cursor-pointer text-blue-400;
  }
  .text-block :global(a:hover) {
    text-decoration: underline;
  }

  .text-block :global(h1),
  .text-block :global(h2),
  .text-block :global(h3) {
    @apply font-bold font-title;
  }

  .text-block :global(h1) {
    @apply text-2xl;
  }
  .text-block :global(h2) {
    @apply text-xl;
  }
  .text-block :global(h3) {
    @apply text-lg;
  }

  .text-block :global(ul) {
    @apply list-disc pl-6;
  }
</style>
