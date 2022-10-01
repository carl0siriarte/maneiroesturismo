<script lang="ts">
  import Submenu from '$lib/components/Submenu.svelte'
  import { tooltip } from '$lib/components/tooltip'
  import Editor from '$lib/editor/Editor.svelte'
  import {
    Add16,
    ChevronDown16,
    ChevronUp16,
    Document16,
    TrashCan16,
  } from 'carbon-icons-svelte'
  import { onMount, type SvelteComponent } from 'svelte'
  import { flip } from 'svelte/animate'
  import { expoOut } from 'svelte/easing'
  import type { Writable } from 'svelte/store'
  import { fly, slide } from 'svelte/transition'
  import { NodeType, type BlocksNodes, type Node } from '.'

  type Element = {
    icon: new (args: { target: any; props?: any }) => SvelteComponent
    node: Omit<Node, 'id'>
    title: string
  }

  const elements: Element[] = [
    {
      icon: Document16,
      title: 'Texto',
      node: {
        type: NodeType.text,
        content: '',
      },
    },
  ]

  export let root: Writable<BlocksNodes>

  onMount(() => {
    root.update((root) => {
      root.nodes = root.nodes.map((n) => ({
        ...n,
        id: n.id || crypto.randomUUID(),
      }))
      return root
    })
  })

  function deleteNode(idx) {
    root.update((root) => {
      root.nodes.splice(idx, 1)
      return root
    })
  }

  function addNode(element: Element) {
    root.update((root) => {
      root.nodes.push({ ...element.node, id: randomUUID() })
      return root
    })
  }

  function moveNode(from: number, to: number) {
    root.update((root) => {
      const nodes = [...root.nodes]
      nodes.splice(to, 0, nodes.splice(from, 1)[0])
      root.nodes = nodes
      return root
    })
  }

  function randomUUID() {
    return crypto.randomUUID()
  }
</script>

<div class="flex flex-col space-y-2 w-full relative">
  <div class="flex flex-col space-y-6 w-full">
    {#each $root.nodes as node, idx (node.id)}
      {@const el = elements.find((el) => el.node.type == node.type)}
      <div
        class="flex flex-col space-y-1 w-full p-2 relative"
        in:fly={{ duration: 200, x: -5 }}
        animate:flip={{ duration: 400, easing: expoOut }}
      >
        <div class="flex w-full justify-between items-center">
          <div class="flex font-bold space-x-2 text-xs items-center">
            {#if el}
              <svelte:component this={el.icon} class="flex" />
              <span>{el.title}</span>
            {/if}
          </div>
          <div class="flex space-x-2 items-center">
            {#if $root.nodes.length > 1}
              {#if idx > 0}
                <button
                  type="button"
                  title="Mover elemento hacia arriba"
                  use:tooltip
                  class="border rounded-full flex space-x-2 bg-blue-500 border-blue-500 shadow-lg opacity-50 p-2 transition-opacity text-gray-100 text-dark-900 duration-200 items-center hover:opacity-100"
                  on:click={() => moveNode(idx, idx - 1)}
                >
                  <ChevronUp16 />
                </button>
              {/if}
              {#if idx != $root.nodes?.length - 1}
                <button
                  type="button"
                  title="Mover elemento hacia abajo"
                  use:tooltip
                  class="border rounded-full flex space-x-2 bg-blue-500 border-blue-500 shadow-lg opacity-50 p-2 transition-opacity text-gray-100 text-dark-900 duration-200 items-center hover:opacity-100"
                  on:click={() => moveNode(idx, idx + 1)}
                >
                  <ChevronDown16 />
                </button>
              {/if}
            {/if}
            <button
              type="button"
              title="Eliminar elemento"
              use:tooltip
              class="border rounded-full flex space-x-2 bg-red-500 border-gray-300 shadow-lg opacity-50 p-2 transition-opacity text-gray-100 text-dark-900 duration-200 items-center hover:opacity-100"
              on:click={() => deleteNode(idx)}
            >
              <TrashCan16 />
            </button>
          </div>
        </div>
        <div class="relative">
          {#if node.type == NodeType.text}
            <div class="text-block">
              <Editor bind:value={node.content} />
            </div>
          {/if}
        </div>
      </div>
    {/each}
    <div class="flex">
      <Submenu x="left" y="top">
        <button
          slot="button"
          type="button"
          class="border rounded-full flex space-x-2 bg-gray-100 border-gray-500 shadow-lg opacity-75 p-2 text-dark-900 duration-200 items-center hover:opacity-100"
        >
          <Add16 />
          <span class="font-bold text-xs">Agregar elemento</span>
        </button>
        <div
          class="flex flex-col font-bold space-y-3 text-xs text-gray-800 dark:text-white"
          slot="body"
        >
          {#each elements as el}
            <button
              class="flex font-normal space-x-2 items-center disabled:cursor-not-allowed disabled:opacity-50 hover:not-disabled:underline"
              on:click={() => addNode(el)}
            >
              <svelte:component this={el.icon} class="flex" />
              <span>{el.title}</span>
            </button>
          {/each}
        </div>
      </Submenu>
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
