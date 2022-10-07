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
