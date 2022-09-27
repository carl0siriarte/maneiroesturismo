<script lang="ts">
  import { goto } from '$app/navigation'
  import { tooltip } from '$lib/components/tooltip'

  import { getAbsoluteURL } from '$lib/utils/host'
  import type { Place } from '@pkg/db'
  import { Launch16, Map24 } from 'carbon-icons-svelte'

  export let place: Place
</script>

<button
  type="button"
  class="bg-white border rounded-lg flex border-gray-300 w-full p-4 transform transition-transform duration-200 dark:bg-dark-700 dark:border-dark-100 hover:scale-98"
  style:will-change="transform"
  on:click={() => goto(`/places/${place.slug}`)}
>
  <div class="flex flex-col space-y-2 w-full items-start">
    <div class="flex w-full justify-between">
      <Map24 />
      <a
        title="Abrir feed de la localidad"
        href={getAbsoluteURL({
          subdomain: place.slug,
        })}
        use:tooltip
        target="_blank"
        on:click|stopPropagation={() => {}}
      >
        <Launch16 class="flex" />
      </a>
    </div>
    <a
      href="/places/{place.slug}"
      class="font-bold font-title text-sm hover:underline"
    >
      {place.name}
    </a>
    <div class="text-xs">
      {getAbsoluteURL({
        subdomain: place.slug,
      })}
    </div>
  </div>
</button>
