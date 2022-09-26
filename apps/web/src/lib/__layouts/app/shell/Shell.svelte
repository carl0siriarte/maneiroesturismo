<script>
  import { page } from '$app/stores'
  import { expoOut } from 'svelte/easing'
  import { fade } from 'svelte/transition'
  import Header from './Header.svelte'
</script>

<div class="flex flex-col min-h-screen w-full justify-between">
  <Header />
  {#key $page.routeId}
    <div
      class="flex-grow flex flex-col h-full p-4 lg:px-[5%]"
      in:fade|local={{ duration: 400, easing: expoOut }}
    >
      <slot />
    </div>
  {/key}
</div>
