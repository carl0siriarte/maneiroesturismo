<script lang="ts">
  import { OverflowMenuVertical16, View16 } from 'carbon-icons-svelte'

  export let title = 'Submenu'

  export let y: 'bottom' | 'top' = 'bottom'
  export let x: 'left' | 'right' = 'right'
  export let fullWidth = false
</script>

<div class="wrapper relative {y}">
  <slot name="button">
    <button
      class="border-transparent rounded flex space-x-1 border-2 p-1 duration-200 items-center hover:border-gray-300 dark:hover:border-gray-500"
      type="button"
    >
      <div class="text-xs">{title}</div>
      <OverflowMenuVertical16 /></button
    >
  </slot>
  <div
    class="transform flex {x == 'left'
      ? 'origin-top-left left-0'
      : 'origin-top-right right-0'} z-50 translate-0 absolute body !duration-200"
    class:min-w-full={fullWidth}
  >
    <div
      class="bg-white border rounded border-gray-300 w-full p-2 dark:bg-dark-800 dark:border-dark-100"
    >
      <slot name="body" />
    </div>
  </div>
</div>

<style>
  .body {
    transition: transform, opacity;
    white-space: nowrap;
    will-change: transform;
  }
  .bottom .body {
    top: 100%;
    @apply pt-2;
  }

  .top .body {
    bottom: 100%;
    @apply pb-2;
  }

  .wrapper:not(:hover) > .body {
    opacity: 0;
    pointer-events: none;
    @apply -translate-y-2;
  }
</style>
