<script lang="ts">
  import { tooltip } from '$lib/components/tooltip'
  import Editor from '$lib/editor/Editor.svelte'
  import { Document16, Image24 } from 'carbon-icons-svelte'

  export let editable = false

  let value = ''
  let count = 0
</script>

{#if editable}
  <div
    class="border-b space-y-2 bg-gray-100 border-gray-300 pb-2 dark:bg-dark-800 dark:border-dark-100"
  >
    <div class="flex font-bold space-x-2 text-xs pb-2 items-center">
      <Document16 class="flex" />
      <span>Redactar publicación</span>
    </div>
    <div
      class="bg-white border rounded text-sm text-block p-2 rouded dark:bg-dark-400 dark:border-dark-100"
    >
      <Editor bind:value bind:count />
    </div>
    <div class="flex w-full justify-between items-center">
      <div
        class="font-bold text-xs text-gray-400 duration-100 animate-duration-800"
        class:!text-red-500={count >= 500}
        class:animate-head-shake={count >= 500}
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
          >Publicar</button
        >
      </div>
    </div>
  </div>
{/if}

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
