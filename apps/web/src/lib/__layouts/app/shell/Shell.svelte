<script>
  import { page } from '$app/stores'
  import { fade } from 'svelte/transition'
  import Header from './Header.svelte'
</script>

<div class="flex flex-col min-h-screen w-full justify-between">
  <Header />
  {#key $page.routeId}
    <div
      class="flex-grow flex flex-col h-full"
      in:fade|local={{ duration: 200 }}
    >
      <slot />
    </div>
  {/key}
</div>
