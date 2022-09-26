<script>
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
      <UserAvatarFilled32
        class="h-48px mb-2 text-dark-500 w-48px dark:text-white"
      />
    {/if}
    <slot />
  </div>
</div>
