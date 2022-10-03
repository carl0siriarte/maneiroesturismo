<script lang="ts">
  import { navigating, page } from '$app/stores'
  import Favicons from '$lib/components/Favicons.svelte'
  import { fade } from 'svelte/transition'
  import { expoOut } from 'svelte/easing'
  import { writable } from 'svelte/store'
  import { onMount, setContext } from 'svelte'
  import { portal } from 'svelte-portal'
  import Shell from './place/shell/Shell.svelte'
  import { pageContext } from '$lib/stores'

  $: pageTitle =
    ($page.data.title ? $page.data.title + ' | ' : '') + 'Maneiro es Turismo'

  let el: HTMLDivElement | undefined
  const navHeight = writable(0)

  let mounted = false
  onMount(() => {
    mounted = true
  })

  setContext('navHeight', navHeight)

  let spinnerTimer: NodeJS.Timeout | undefined
  let showSpinner = true
  function startSpinner() {
    spinnerTimer = setTimeout(() => {
      showSpinner = true
    }, 200)
  }
  function stopSpinner() {
    showSpinner = false
    clearTimeout(spinnerTimer)
  }

  $: if ($navigating) {
    startSpinner()
  } else {
    stopSpinner()
  }
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

{#if showSpinner}
  <div
    class="cursor-wait flex h-full w-full top-0 z-99 fixed items-center justify-center"
    class:backdrop-filter={mounted}
    class:backdrop-blur-md={mounted}
    class:bg-dark-800={!mounted}
    transition:fade|local={{ duration: 400, easing: expoOut }}
    use:portal
  >
    <div class="bg-black h-full w-full opacity-70 absolute" />
    <div class="lds-ring">
      <div />
      <div />
      <div />
      <div />
    </div>
  </div>
{/if}

<Favicons
  favicon={$pageContext.context.place?.logo || '/images/logo.svg'}
  themeColor="#000"
  titleName={$pageContext.context.place?.name}
  description={$page.data.description}
/>

{#if !$page.data.hideLayout}
  <Shell>
    <slot />
  </Shell>
{:else}
  <slot />
{/if}

<style>
  .lds-ring {
    display: flex;
    position: relative;
    width: 32px;
    height: 32px;
  }
  .lds-ring div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 32px;
    height: 32px;
    margin: 0px;
    border: 4px solid white;
    border-radius: 50%;
    animation: lds-ring 2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: white transparent transparent transparent;
  }

  .lds-ring div:nth-child(1) {
    animation-delay: -0.45s;
  }
  .lds-ring div:nth-child(2) {
    animation-delay: -0.3s;
  }
  .lds-ring div:nth-child(3) {
    animation-delay: -0.15s;
  }
  @keyframes lds-ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
