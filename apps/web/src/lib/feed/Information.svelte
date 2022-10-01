<script lang="ts">
  import { BlockEditor } from '$lib/block-editor'
  import BlockRenderer from '$lib/block-editor/BlockRenderer.svelte'
  import type { PlaceData } from '@pkg/db'
  import { getContext } from 'svelte'
  import { keyed } from 'svelte-keyed'
  import type { Writable } from 'svelte/store'
  export let editable = false

  const placeData = getContext<Writable<PlaceData>>('placeData')

  const information = keyed(placeData, 'information')
</script>

<div class="flex flex-col space-y-4">
  <div class="flex space-x-4 items-center">
    <h2 class="font-bold text-xl">Información</h2>
  </div>
  {#if editable}
    <div class="pb-24">
      <BlockEditor root={information} />
    </div>
  {:else}
    <BlockRenderer root={information} />
  {/if}
</div>
