<script lang="ts">
  import { page } from '$app/stores'
  import { notifications } from '$lib/components/notifications'
  import trpc from '$lib/trpc/client'
  import { onMount } from 'svelte'
  import { expoOut } from 'svelte/easing'
  import { slide } from 'svelte/transition'
  import LoginLayout from './LoginLayout.svelte'

  let loading = false
  let isLogin = true
  let emailEl: HTMLInputElement
  let email: string, password: string, rePassword: string, name: string

  onMount(() => {
    emailEl.focus()
  })
  let error: Error | undefined
  async function handleSubmit() {
    error = undefined
    loading = true
    try {
      if (!isLogin) {
        if (password !== rePassword) {
          throw new Error('Las contraseñas deben ser iguales')
        }
      }
      if (isLogin) {
        await trpc().mutation('user:login', {
          email: email?.toLocaleLowerCase(),
          password,
        })
      } else {
        await trpc().mutation('user:register', {
          user: {
            email: email?.toLocaleLowerCase(),
            name,
          },
          password,
        })
      }
      const callbackUrl = decodeURIComponent(
        $page.url.searchParams.get('callbackUrl') || encodeURIComponent('/')
      )
      window.location.replace(callbackUrl)
    } catch (err) {
      error = err
      loading = false
    }
  }
</script>

<LoginLayout>
  <div class="flex mb-2 w-full items-center justify-between">
    <h2 class="font-bold font-title text-lg text-dark-900 dark:text-white">
      {!isLogin ? 'Regístrate' : 'Inicia sesión'}
    </h2>
    <button
      class="text-xs text-blue-500 inline hover:underline"
      on:click={() => (isLogin = !isLogin)}
      on:click={() => (error = undefined)}
      type="reset">{isLogin ? `Regístrate` : 'Inicia sesión'}</button
    >
  </div>
  <form
    on:submit|preventDefault|stopPropagation={handleSubmit}
    class="flex flex-col space-y-4 transition-opacity duration-400"
  >
    {#if error}
      <p
        transition:slide={{ duration: 400, easing: expoOut }}
        class="text-xs text-left w-full text-red-500"
      >
        {error.message}
      </p>
    {/if}
    <input
      class="bg-white border rounded border-gray-300 text-sm leading-tight w-full py-2 px-3 appearance-none dark:bg-dark-700 dark:border-dark-300 focus:outline-none focus:shadow-outline"
      type="email"
      autocomplete="off"
      placeholder="Dirección de email"
      required
      bind:value={email}
      bind:this={emailEl}
    />
    {#if !isLogin}
      <input
        class="bg-white border rounded border-gray-300 text-sm leading-tight w-full py-2 px-3 appearance-none dark:bg-dark-700 dark:border-dark-300 focus:outline-none focus:shadow-outline"
        transition:slide|local={{ duration: 400, easing: expoOut }}
        type="text"
        autocomplete="off"
        placeholder="Nombre"
        required
        bind:value={name}
      />
    {/if}
    <input
      class="bg-white border rounded border-gray-300 text-sm leading-tight w-full py-2 px-3 appearance-none dark:bg-dark-700 dark:border-dark-300 focus:outline-none focus:shadow-outline"
      type="password"
      autocomplete="off"
      placeholder="Contraseña"
      required
      bind:value={password}
    />
    {#if !isLogin}
      <input
        class="bg-white border rounded border-gray-300 text-sm leading-tight w-full py-2 px-3 appearance-none dark:bg-dark-700 dark:border-dark-300 focus:outline-none focus:shadow-outline"
        transition:slide|local={{ duration: 400, easing: expoOut }}
        type="password"
        autocomplete="off"
        placeholder="Repite la contraseña"
        required
        bind:value={rePassword}
      />
    {/if}
    <button
      class="rounded-lg font-bold border-2 border-blue-500 text-sm py-2 px-2 transform-gpu text-blue-500 duration-200 hover:shadow disabled:cursor-not-allowed disabled:opacity-70 not-disabled:hover:-translate-y-px "
      disabled={loading}
      type="submit"
      >{loading
        ? 'Cargando...'
        : isLogin
        ? 'Iniciar sesión'
        : 'Regístrate'}</button
    >
    {#if isLogin}
      <a
        transition:slide|local={{ duration: 400, easing: expoOut }}
        class="text-xs text-blue-500 self-end inline hover:underline"
        href="/login/recover">Perdiste tu contraseña?</a
      >
    {/if}
  </form>
</LoginLayout>
