<script>
  import { page } from '$app/stores'
  import { fade } from 'svelte/transition'
  import Header from './Header.svelte'

  let headerHeight = 0
</script>

<div
  class="flex flex-col min-h-screen w-full justify-between"
  style:--header-height="{headerHeight}px"
>
  <Header bind:headerHeight />
  {#key $page.route.id}
    <div
      class="flex-grow flex flex-col h-full"
      in:fade|local={{ duration: 200 }}
    >
      <slot />
    </div>
  {/key}
</div>
