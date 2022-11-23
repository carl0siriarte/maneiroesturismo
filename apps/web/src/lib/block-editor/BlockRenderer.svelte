<script lang="ts">
  import Image from '$lib/components/caravaggio/Image.svelte'
  import type { Writable } from 'svelte/store'
  import { NodeType, type BlocksNodes } from '.'

  export let root: Writable<BlocksNodes<any>>
</script>

<div class="flex flex-col space-y-4 w-full">
  {#each $root.nodes as node, idx}
    {#if node.type == NodeType.text && node.content}
      <div class="text-block">
        {@html node.content}
      </div>
    {:else if node.type == NodeType.image && node.url}
      <div class="relative lg:px-24">
        <Image
          src={node.url}
          class="rounded-lg flex w-full"
          lazy
          width="500"
          height="500"
          options={{
            rs: {
              s: '500x500',
              m: 'upfit',
              b: '000000.0',
            },
          }}
        />
      </div>
    {/if}
  {/each}
</div>
