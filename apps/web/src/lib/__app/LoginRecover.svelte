<script lang="ts">
  import { page } from '$app/stores'
  import { squareratio } from '$lib/actions/aspectratio'
  import { notifications } from '$lib/components/notifications'
  import trpc from '$lib/trpc/client'
  import { CheckmarkFilled32 } from 'carbon-icons-svelte'
  import { onMount } from 'svelte'
  import { elasticOut, expoOut } from 'svelte/easing'
  import { fly, scale, slide } from 'svelte/transition'
  import LoginLayout from './LoginLayout.svelte'

  let error: Error | undefined
  let loading = false
  let form = ''
  let repwd = ''
  let el: HTMLInputElement

  $: token = $page.url.searchParams.get('token')
  let done = false

  onMount(() => {
    el.focus()
  })
  async function handleSubmit() {
    loading = true
    error = undefined
    try {
      if (token) {
        if (form !== repwd) {
          throw new Error('The passwords must be equals', {
            cause: 'INEQUALSPWD',
          })
        }
        await trpc().mutation('user:recoverPassword', {
          newPassword: form,
          token,
        })
      } else {
        await trpc().mutation('user:issuePasswordRecoveryToken', {
          email: form,
        })
      }
      done = true
    } catch (err) {
      error = err
    } finally {
      loading = false
    }
  }
</script>

<LoginLayout avatar={!done}>
  {#if done}
    <div class="flex flex-col space-y-4 items-center justify-center">
      <div
        class="mx-auto w-4/10 aspect-square"
        use:squareratio
        in:scale={{
          easing: elasticOut,
          start: 0,
          duration: 800,
          opacity: 1,
        }}
      >
        <CheckmarkFilled32 class="h-full w-full text-green-500" />
      </div>
      <div
        class="mx-auto text-center text-sm text-gray-500"
        in:fly={{
          delay: 200,
          duration: 400,
          y: 5,
        }}
      >
        {#if token}
          Contraseña cambiada con éxito
        {:else}
          Te hemos enviado un email donde podrás cambiar tu contraseña
        {/if}
      </div>
      {#if token}
        <a
          in:fly={{
            delay: 400,
            duration: 400,
            y: 5,
          }}
          class="text-center text-sm text-blue-500 inline hover:underline"
          href="/login">Inicia sesión con tu cuenta</a
        >
      {/if}
    </div>
  {:else}
    <div class="flex space-x-6 mb-2 w-full items-center justify-between">
      <h2 class="font-bold font-title text-lg text-dark-900 dark:text-white">
        Cambiar contraseña
      </h2>
      <a class="text-xs text-blue-500 inline hover:underline" href="/login"
        >Inicia sesión</a
      >
    </div>
    <form
      on:submit|preventDefault|stopPropagation={handleSubmit}
      class="flex flex-col space-y-4 w-full transition-opacity duration-400"
    >
      {#if error}
        <p
          transition:slide={{ duration: 400, easing: expoOut }}
          class="text-xs text-left w-full text-red-500"
        >
          {error.message}
        </p>
      {/if}
      {#if !token}
        <input
          class="bg-white border rounded border-gray-300 text-sm leading-tight w-full py-2 px-3 appearance-none dark:bg-dark-700 dark:border-dark-300 focus:outline-none focus:shadow-outline"
          type="email"
          autocomplete="off"
          placeholder="Dirección de email"
          required
          bind:value={form}
          bind:this={el}
        />
      {:else}
        <input
          class="bg-white border rounded border-gray-300 text-sm leading-tight w-full py-2 px-3 appearance-none dark:bg-dark-700 dark:border-dark-300 focus:outline-none focus:shadow-outline"
          type="password"
          autocomplete="off"
          placeholder="Contraseña"
          bind:value={form}
          bind:this={el}
          required
        />
        <input
          class="bg-white border rounded border-gray-300 text-sm leading-tight w-full py-2 px-3 appearance-none dark:bg-dark-700 dark:border-dark-300 focus:outline-none focus:shadow-outline"
          class:!border-red-500={error?.cause === 'INEQUALSPWD'}
          class:!bg-red-700={error?.cause === 'INEQUALSPWD'}
          class:!bg-opacity-50={error?.cause === 'INEQUALSPWD'}
          type="password"
          autocomplete="off"
          placeholder="Repite la contraseña"
          bind:value={repwd}
          required
        />
      {/if}
      <button
        class="rounded-lg font-bold border-2 border-blue-500 text-sm py-2 px-2 transform-gpu text-blue-500 duration-200 hover:shadow disabled:cursor-not-allowed disabled:opacity-70 not-disabled:hover:-translate-y-px"
        disabled={loading}
        type="submit"
        >{loading
          ? 'Cargando...'
          : token
          ? 'Cambiar contraseña'
          : 'Comprobar email'}</button
      >
    </form>
  {/if}
</LoginLayout>
