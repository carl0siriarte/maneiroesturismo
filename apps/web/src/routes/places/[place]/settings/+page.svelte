<script lang="ts">
  import { pageContext } from '$lib'
  import type { PageData } from './$types'
  import { Settings24 } from 'carbon-icons-svelte'
  import { elasticOut, expoOut } from 'svelte/easing'
  import { scale, slide } from 'svelte/transition'
  import { trpc } from '$lib/trpc/client'
  import { goto, invalidateAll } from '$app/navigation'
  import type { RouterTypes } from '@pkg/trpc'

  export let data: PageData
  let error: Error | undefined

  let saving = false
  let place: RouterTypes['places']['update']['input'] = {
    id: $pageContext.context.place!.id,
    name: $pageContext.context.place!.name,
    slug: $pageContext.context.place!.slug,
  }
  const submit = async () => {
    saving = true
    try {
      // const created = await trpc.places.create.mutate(place)
      const updated = await trpc.places.update.mutate(place)
      await goto(`/places/${updated.slug}/settings`, {
        replaceState: true,
        noScroll: true,
        keepFocus: true,
      })
      invalidateAll()
    } catch (err) {
      console.log(err)
      error = err
    } finally {
      saving = false
    }
  }

  const del = async () => {
    saving = true
    try {
      // const created = await trpc.places.create.mutate(place)
      await trpc.places.delete.mutate(place.id)
      goto(`/`)
    } catch (err) {
      console.log(err)
      error = err
    } finally {
      saving = false
    }
  }
</script>

<div class="flex flex-grow h-full w-full items-center justify-center">
  <div
    class="bg-white border rounded-xl flex flex-col border-gray-300 p-4 items-center dark:bg-dark-700 dark:border-dark-100"
    style="will-change: transform"
    in:scale={{ duration: 400, start: 0.9, easing: elasticOut }}
  >
    <form
      class="flex flex-col space-y-4 w-full transition-opacity duration-400"
      on:submit|preventDefault|stopPropagation={submit}
    >
      <div class="flex space-x-2 items-center">
        <Settings24 class="flex" />
        <h2
          class="font-bold font-title text-black text-lg w-full dark:text-white"
        >
          Configuración de la localidad
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
      <label class="flex flex-col space-y-1 w-full">
        <span class="font-bold text-xs">Nombre de la localidad</span>
        <input
          class="bg-white border rounded border-gray-300 text-sm leading-tight w-full py-2 px-3 appearance-none dark:bg-dark-700 dark:border-dark-100 focus:outline-none focus:shadow-outline"
          type="text"
          autocomplete="off"
          placeholder="Ej. Municipio Maneiro"
          bind:value={place.name}
          required
        />
      </label>
      <label class="flex flex-col space-y-1 w-full" for="slug">
        <span class="font-bold text-xs">Subdominio</span>
        <div class="flex">
          <input
            class="bg-white border rounded-tl rounded-bl border-gray-300 text-xs leading-tight w-full py-2 px-3 w-24 appearance-none dark:bg-dark-700 dark:border-dark-100 focus:outline-none focus:shadow-outline"
            name="slug"
            type="text"
            bind:value={place.slug}
            placeholder="Subdominio"
            required
          />
          <div
            class="border-t border-b border-r rounded-tr rounded-br font-bold bg-light-500 border-gray-300 text-xs leading-tight w-full py-2 px-3 text-cool-gray-700 appearance-none dark:bg-dark-600 dark:border-dark-100 dark:text-cool-gray-100 focus:outline-none focus:shadow-outline"
          >
            .maneiroesturismo.com
          </div>
        </div>
      </label>
      <button
        class="rounded-lg font-bold border-2 border-blue-500 text-sm py-2 px-2 transform-gpu text-blue-500 duration-200 hover:shadow disabled:cursor-not-allowed disabled:opacity-70 not-disabled:hover:-translate-y-px "
        type="submit">Guardar cambios</button
      >
      {#if data.role == 'administrador'}
        <button
          type="button"
          class="rounded-lg font-bold border-2 border-red-500 text-sm py-2 px-2 transform-gpu text-red-500 duration-200 hover:shadow disabled:cursor-not-allowed disabled:opacity-70 not-disabled:hover:-translate-y-px "
          on:click={() => del()}>Eliminar localidad</button
        >
      {/if}
    </form>
  </div>
</div>
