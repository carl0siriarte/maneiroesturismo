<script>
  import Logo from '$lib/Logo.svelte'
  import { UserAvatarFilled32 } from 'carbon-icons-svelte'

  export let avatar = true
</script>

<div
  class="bg-gradient-to-br flex h-screen from-purple-800 to-sky-300 text-center w-full p-4 items-center justify-center dark:(from-cool-gray-600 to-cool-gray-900) "
>
  <div
    class="bg-white rounded-xl flex flex-col shadow-xl p-4 items-center dark:bg-dark-800"
  >
    {#if avatar}
      <div class="mb-6">
        <Logo />
      </div>
    {/if}
    <slot />
  </div>
</div>
