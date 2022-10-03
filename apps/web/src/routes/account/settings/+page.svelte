<script lang="ts">
  import { page } from '$app/stores'
  import { user } from '$lib'
  import Main from '$lib/__layouts/app/shell/Main.svelte'
  import type { User } from '@pkg/db'
  import { UserAvatar24 } from 'carbon-icons-svelte'
  import { elasticOut, expoOut } from 'svelte/easing'
  import { scale, slide } from 'svelte/transition'

  let c: User | undefined
  const setUser = () => {
    c = { ...$user } as User
  }
  $: if ($user) {
    setUser()
  }
  let error = ''
  let loading = false
  const submit = async () => {
    if (!c) return
    try {
      error = ''
      loading = true
      // await trpc.users..mutation('customer:update', c)
    } catch ({ message }) {
      error = message
    } finally {
      loading = false
    }
  }
</script>

<Main class="flex flex-col mx-auto space-y-4 w-full">
  <div class="flex space-x-4 items-center">
    <UserAvatar24 />
    <h3 class="font-bold font-title text-black text-2xl dark:text-white">
      Configuración de la cuenta
    </h3>
  </div>
</Main>
<Main class="flex flex-grow h-full w-full items-center justify-center">
  <div
    class="bg-white border rounded-xl flex flex-col border-gray-300 p-4 items-center dark:bg-dark-700 dark:border-dark-100"
    style="will-change: transform"
    in:scale={{ duration: 400, start: 0.9, easing: elasticOut }}
  >
    <form
      class="flex flex-col space-y-4 w-full transition-opacity duration-400 items-center"
      on:submit|preventDefault|stopPropagation={submit}
    >
      {#if c}
        <div
          class="bg-gradient-to-br border rounded-full flex font-bold font-title from-green-300 to-pink-600 border-gray-200 h-72px text-white text-4xl leading-[0] w-72px items-center justify-center uppercase dark:bg-gray-600 dark:from-green-400 dark:to-pink-700"
        >
          {$user?.name[0]}
        </div>
      {:else}
        <div class="rounded-full h-72px w-72px skeleton" />
      {/if}

      {#if error}
        <div
          class="text-xs w-full text-red-500"
          transition:slide|local={{ duration: 400, easing: expoOut }}
        >
          <span class="font-bold">Error:</span>
          {error}
        </div>
      {/if}
      <div class="flex space-x-2 w-full items-center">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="flex flex-col font-bold space-y-2 text-xs w-full">
          <span> Nombre * </span>
          {#if c}
            <input
              type="text"
              placeholder="Escribe tu nombre"
              required
              class="bg-white border rounded border-gray-300 text-sm leading-tight w-full py-2 px-3 appearance-none dark:bg-dark-700 dark:border-dark-100 focus:outline-none focus:shadow-outline"
              bind:value={c.name}
            />
          {:else}
            <div class="rounded h-33px w-full skeleton" />
          {/if}
        </label>
      </div>
      <div class="flex space-x-2 w-full items-center">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="flex flex-col font-bold space-y-2 text-xs w-full">
          <span> Email * </span>
          {#if c}
            <input
              type="email"
              placeholder="Ej. example@domain.com"
              required
              class="bg-white border rounded border-gray-300 text-sm leading-tight w-full py-2 px-3 appearance-none dark:bg-dark-700 dark:border-dark-100 focus:outline-none focus:shadow-outline"
              bind:value={c.email}
            />
          {:else}
            <div class="rounded h-33px w-full skeleton" />
          {/if}
        </label>
        <!-- svelte-ignore a11y-label-has-associated-control -->
      </div>
      <button
        class="rounded-lg font-bold border-2 border-blue-500 text-sm w-full py-2 px-2 transform-gpu text-blue-500 duration-200 hover:shadow disabled:cursor-not-allowed disabled:opacity-70 not-disabled:hover:-translate-y-px"
        disabled={loading || !c}
        type="submit"
        >{loading
          ? 'Aplicando...'
          : c
          ? 'Aplicar cambios'
          : 'Cargando...'}</button
      >
    </form>
  </div>
</Main>
