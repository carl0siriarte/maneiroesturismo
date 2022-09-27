<script>
  import { MapBoundary24 } from 'carbon-icons-svelte'
  import Viewport from './components/Viewport.svelte'
</script>

<Viewport class="flex space-x-4 items-center" --a-t="600ms" oneWay>
  <div class="flex space-x-2 items-center">
    <MapBoundary24 class="flex anim" --anim-s="0.1" --anim-d="100ms" />
    <span
      class="font-bold font-title text-sm text-dark-900 uppercase anim dark:text-gray-100"
      style:--anim-x="-0.1rem"
      style:--anim-d="300ms">Maneiro es Turismo</span
    >
  </div>
</Viewport>
