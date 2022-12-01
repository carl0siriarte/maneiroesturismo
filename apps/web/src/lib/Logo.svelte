<script lang="ts">
  import type { Place } from '@pkg/db'
  import { Map24, MapBoundary24 } from 'carbon-icons-svelte'
  import Viewport from './components/Viewport.svelte'

  export let place: Place | undefined = undefined
  export let anim = true
</script>

<Viewport class="flex space-x-4 items-center" --a-t="600ms" once>
  <div class="flex space-x-2 items-center">
    {#if place}
      <div class="flex" class:anim style:--anim-s="0.1" style:--anim-d="100ms">
        <!-- {#if place}
        <Map24 class="flex" />
      {:else} -->
        <MapBoundary24 class="flex" />
        <!-- {/if} -->
      </div>
      <span
        class="font-bold font-title text-sm text-dark-900 uppercase anim dark:text-gray-100"
        style:--anim-x="-0.1rem"
        style:--anim-d="300ms"
        class:anim>{place?.name || 'Maneiro es Turismo'}</span
      >
    {:else}
      <img
        src="/images/logo_alt.svg"
        alt="Maneiro es Turismo"
        class="h-38px w-auto"
        class:anim
        style:--anim-x="-0.1rem"
        style:--anim-s="0.1"
        style:--anim-d="100ms"
      />
    {/if}
  </div>
</Viewport>
