<script lang="ts">
  import { user } from '$lib'
  import Editor from '$lib/editor/Editor.svelte'
  import { Forum24 } from 'carbon-icons-svelte'
  import { elasticOut, expoOut } from 'svelte/easing'
  import { scale, slide } from 'svelte/transition'
  let error: Error | undefined = undefined
  let value = ''

  function publish() {
    //trpc
  }
</script>

<div class="flex flex-grow h-full w-full pt-8 items-center justify-center">
  <div
    class="bg-white border rounded-xl flex flex-col border-gray-300 min-w-4/10 p-4 items-center dark:bg-dark-700 dark:border-dark-100"
    style="will-change: transform"
    in:scale={{ duration: 400, start: 0.9, easing: elasticOut }}
  >
    <form
      class="flex flex-col space-y-4 w-full transition-opacity duration-400"
      on:submit|preventDefault|stopPropagation={() => {}}
    >
      <div class="flex space-x-2 items-center">
        <Forum24 />
        <h2
          class="font-bold font-title text-black text-lg w-full dark:text-white"
        >
          Contacto
        </h2>
      </div>
      {#if error}
        <p
          transition:slide={{ duration: 400, easing: expoOut }}
          class="text-xs text-left w-full text-red-500"
        >
          {error.message}
        </p>
      {/if}
      {#if !$user}
        <label class="flex flex-col space-y-1 w-full">
          <span class="font-bold text-xs">Nombre completo</span>
          <input
            class="bg-white border rounded border-gray-300 text-sm leading-tight w-full py-2 px-3 appearance-none dark:bg-dark-700 dark:border-dark-100 focus:outline-none focus:shadow-outline"
            type="text"
            autocomplete="off"
            placeholder="Ej. Maria Gabriela"
            required
          />
        </label>
        <label class="flex flex-col space-y-1 w-full">
          <span class="font-bold text-xs">Correo electrónico</span>
          <input
            class="bg-white border rounded border-gray-300 text-sm leading-tight w-full py-2 px-3 appearance-none dark:bg-dark-700 dark:border-dark-100 focus:outline-none focus:shadow-outline"
            type="email"
            autocomplete="off"
            placeholder="Ej. maria@gmail.com"
            required
          />
        </label>
      {/if}
      <div class="flex flex-col space-y-1 w-full">
        <span class="font-bold text-xs">Mensaje</span>
        <div
          class="bg-white border rounded border-gray-300 h-18 text-sm text-block p-2 rouded overflow-auto dark:bg-dark-400 dark:border-dark-100"
        >
          <Editor bind:value />
        </div>
      </div>
      <button
        class="rounded-lg font-bold border-2 border-blue-500 text-sm py-2 px-2 transform-gpu text-blue-500 duration-200 hover:shadow disabled:cursor-not-allowed disabled:opacity-70 not-disabled:hover:-translate-y-px "
        type="submit">Enviar formulario</button
      >
    </form>
  </div>
</div>
