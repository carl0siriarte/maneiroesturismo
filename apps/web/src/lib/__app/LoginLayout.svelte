<script>
  import Viewport from '$lib/components/Viewport.svelte'
  import Logo from '$lib/Logo.svelte'
  import { pageContext } from '$lib/stores'
  import { Map16, UserAvatarFilled32 } from 'carbon-icons-svelte'

  export let avatar = true
</script>

<div
  class="bg-gradient-to-br flex h-screen from-purple-800 to-sky-300 text-center w-full p-4 items-center justify-center dark:(from-cool-gray-600 to-cool-gray-900) "
>
  <div
    class="bg-white rounded-xl flex flex-col shadow-xl p-4 items-center dark:bg-dark-800"
  >
    {#if avatar}
      <div class="flex flex-col space-y-4 mb-6 items-center">
        <Logo />
        {#if $pageContext.context.place}
          <Viewport
            class="flex space-x-4 pt-2 items-center"
            --a-t="600ms"
            oneWay
          >
            <div class="flex space-x-2 items-center">
              <Map16 class="flex anim" --anim-s="0.1" --anim-d="300ms" />
              <span
                class="font-bold font-title text-xs text-dark-900 uppercase anim dark:text-gray-100"
                style:--anim-x="-0.1rem"
                style:--anim-d="500ms"
              >
                {$pageContext.context.place.name}
              </span>
            </div>
          </Viewport>
        {/if}
      </div>
    {/if}
    <slot />
  </div>
</div>
