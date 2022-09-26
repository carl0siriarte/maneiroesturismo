<script lang="ts">
  import { page } from '$app/stores'
  import { pageContext } from '$lib'
  import { tooltip } from '$lib/components/tooltip'
  import Searchbar from '$lib/__place/Searchbar.svelte'
  import { Copy16 } from 'carbon-icons-svelte'
</script>

<div
  class="flex flex-col min-h-screen space-y-4 p-4 text-dark-900 items-center justify-center dark:text-gray-100"
  class:-m-4={$pageContext.layout === 'app'}
  class:lg:-m-6={$pageContext.layout === 'app'}
>
  <div class="font-bold text-6xl leading-[0.7]">
    {$page.status}
  </div>

  {#if $page.error?.name}
    <p class="font-bold my-4">{$page.error?.name}</p>
  {/if}

  <p class="my-4">{$page.error?.message}</p>

  {#if $page.error?.stack}
    <div class="w-full max-h-[35vh] relative lg:w-6/10">
      <div class="top-2 right-2 absolute">
        <button
          title="Copy"
          use:tooltip
          on:click={() =>
            typeof navigator == 'undefined'
              ? null
              : navigator.clipboard.writeText($page.error?.stack || '')}
          class="border rounded flex bg-gray-100 border-gray-300 shadow-lg opacity-50 p-2 duration-200 dark:bg-gray-800 dark:border-gray-600 hover:opacity-100"
        >
          <Copy16 />
        </button>
      </div>
      <pre
        class="border rounded-md bg-gray-100 border-gray-300 p-2 overflow-auto dark:bg-gray-900 dark:border-gray-600">{$page
          .error.stack}</pre>
    </div>
  {/if}
</div>
