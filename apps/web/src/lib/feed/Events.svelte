<script lang="ts">
  import { portal } from 'svelte-portal'
  import { backOut, expoOut } from 'svelte/easing'
  import { fade, fly, scale } from 'svelte/transition'
  import Calendar from './Calendar.svelte'
  import EventsModal from './EventsModal.svelte'

  let year: number
  let month: number
  let selectedDay: Date | undefined
</script>

{#if selectedDay}
  <div
    class="flex h-full w-full top-0 z-99 fixed items-center justify-center backdrop-filter backdrop-blur-md"
    transition:fade|local={{ duration: 400, easing: expoOut }}
    use:portal
  >
    <div
      class="bg-black h-full w-full opacity-40 absolute"
      on:click={() => (selectedDay = undefined)}
    />
    <div
      class="flex flex-col h-full space-y-2 min-w-5/10 w-full max-w-9/10 max-h-[90vh] relative items-center justify-center pointer-events-none lg:max-w-9/10"
      in:fly|local={{ y: 20, duration: 400, easing: backOut }}
      out:scale|local={{ start: 0.2, duration: 200, easing: expoOut }}
    >
      <EventsModal
        date={selectedDay}
        on:close={() => {
          selectedDay = undefined
        }}
      />
    </div>
  </div>
{/if}

<Calendar
  bind:year
  bind:month
  on:dayClick={({ detail }) => {
    if (detail.enabled) {
      selectedDay = detail.date
    }
  }}
/>
