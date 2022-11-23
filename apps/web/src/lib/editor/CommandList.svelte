<script>
  import { clamp } from '$lib/utils/math'
  import { portal } from 'svelte-portal'
  import { expoOut } from 'svelte/easing'

  import { fly, slide } from 'svelte/transition'

  export let selectedIndex = 0
  import { slashVisible, slashItems, slashLocation, slashProps } from './stores'

  let height = 0
  let width = 0
  let scrollY = 0
  let wrapperHeight = 0
  let wrapperWidth = 0

  let elements = []

  $: invert = $slashLocation.y - scrollY + wrapperHeight > (height || 0)

  $: left = clamp({
    min: 0,
    max: width - 28,
    val: $slashLocation.x + wrapperWidth,
  })
</script>

<svelte:window bind:innerHeight={height} bind:innerWidth={width} bind:scrollY />

{#if $slashVisible}
  <div
    class="h-screen w-full top-0 absolute"
    on:click={() => ($slashVisible = false)}
    use:portal
  />
  <div
    class="bg-white border rounded border-gray-300 shadow max-h-72 w-72 z-999 absolute overflow-auto backdrop-filter backdrop-blur-md !bg-opacity-60 dark:bg-dark-800 dark:border-dark-100"
    use:portal
    transition:fly|local={{ duration: 200, y: 5, easing: expoOut }}
    bind:clientHeight={wrapperHeight}
    bind:clientWidth={wrapperWidth}
    style="max-width: 100%; left: {left - wrapperWidth}px; top: {invert
      ? $slashLocation.y - $slashLocation.height - wrapperHeight
      : $slashLocation.y + $slashLocation.height}px;"
  >
    <!-- <div class="font-bold text-sm p-2 top-0 left-0 text-slate-500 uppercase">
      {$slashLocation.y - scrollY}
      {height}
    </div> -->
    {#if $slashItems.length}
      {#each $slashItems as { title, subtitle, command, icon }, i (title)}
        <div
          class="p-3 cursor-pointer {i == selectedIndex
            ? 'bg-gray-100 dark:bg-dark-100 !bg-opacity-50'
            : ''}"
          transition:slide|local={{ duration: 200, easing: expoOut }}
          on:mouseenter={() => (selectedIndex = i)}
          on:click={() => {
            $slashVisible = false
            command($slashProps)
          }}
          bind:this={elements[i]}
        >
          <div class="flex space-x-2 items-center">
            {#if icon}
              <svelte:component this={icon} />
            {/if}
            <div class="flex flex-col">
              <div class="font-bold text-sm">{title}</div>
              <div class="text-xs opacity-75">
                {subtitle ? subtitle : ''}
              </div>
            </div>
          </div>
        </div>
      {/each}
    {:else}
      <div class="w-full p-3">
        <div class="font-bold text-center opacity-50">No se encuentra nada</div>
      </div>
    {/if}
  </div>
{/if}
