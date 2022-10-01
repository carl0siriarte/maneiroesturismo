<script lang="ts">
  import type { Writable } from 'svelte/store'
  import { NodeType, type BlocksNodes, type Node } from '.'

  export let root: Writable<BlocksNodes>
</script>

<div class="flex flex-col space-y-4 w-full">
  {#each $root.nodes as node, idx}
    {#if node.type == NodeType.text && node.content}
      <div class="text-block">
        {@html node.content}
      </div>
    {/if}
  {/each}
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
