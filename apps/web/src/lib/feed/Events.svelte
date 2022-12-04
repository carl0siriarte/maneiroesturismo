<script lang="ts">
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { portal } from 'svelte-portal'
  import { backOut, expoOut } from 'svelte/easing'
  import { fade, fly, scale } from 'svelte/transition'
  import Calendar from './Calendar.svelte'
  import EventsModal from './EventsModal.svelte'

  let year: number
  let month: number
  $: selectedDay = $page.url.searchParams.has('date')
    ? new Date($page.url.searchParams.get('date') || '')
    : undefined

  function dateURL(date: Date) {
    let searchParams = new URLSearchParams($page.url.searchParams)
    searchParams.delete('eventId')
    searchParams.set('date', date.toISOString())
    return $page.url.pathname + '?' + searchParams.toString()
  }

  function resetURL() {
    let searchParams = new URLSearchParams($page.url.searchParams)
    searchParams.delete('eventId')
    searchParams.delete('date')
    goto($page.url.pathname + '?' + searchParams.toString(), {
      keepFocus: true,
      noScroll: true,
    })
  }
</script>

{#if selectedDay && browser}
  <div
    class="flex h-full w-full top-0 z-99 fixed items-center justify-center backdrop-filter backdrop-blur-md"
    transition:fade|local={{ duration: 400, easing: expoOut }}
    use:portal
  >
    <div
      class="bg-black h-full w-full opacity-40 absolute"
      on:click={resetURL}
    />
    <div
      class="flex flex-col h-full space-y-2 min-w-5/10 w-full max-w-9/10 max-h-[90vh] relative items-center justify-center pointer-events-none lg:max-w-9/10"
      in:fly|local={{ y: 20, duration: 400, easing: backOut }}
      out:scale|local={{ start: 0.2, duration: 200, easing: expoOut }}
    >
      <EventsModal date={selectedDay} on:close={resetURL} />
    </div>
  </div>
{/if}

<Calendar
  bind:year
  bind:month
  on:dayClick={({ detail }) => {
    if (detail.enabled) {
      goto(dateURL(detail.date), { keepFocus: true, noScroll: true })
    }
  }}
/>
