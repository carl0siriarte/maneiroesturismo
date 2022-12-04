<script lang="ts">
  import { page } from '$app/stores'
  import UsersList from '$lib/__app/UsersList.svelte'
  import Main from '$lib/__layouts/app/shell/Main.svelte'
  import type { PlaceMemberRole } from '@pkg/db'
  import {
    Close24,
    UserMultiple24,
    UserProfile16,
    UserProfile24,
  } from 'carbon-icons-svelte'
  import { portal } from 'svelte-portal'
  import { expoOut } from 'svelte/easing'
  import { fade, fly } from 'svelte/transition'
  let invitationDialog = false

  $: currentRole = $page.data.role as PlaceMemberRole
</script>

{#if invitationDialog}
  <div
    class="flex h-full w-full top-0 z-99 fixed items-center justify-center backdrop-filter backdrop-blur-md"
    transition:fade={{ duration: 300, easing: expoOut }}
    use:portal
  >
    <div
      class="bg-black h-full w-full opacity-70 absolute"
      on:click={() => {
        invitationDialog = false
      }}
    />
    <form
      class="bg-white rounded-xl flex flex-col space-y-4 shadow max-h-9/10 p-4 relative lg:max-w-4/10 dark:bg-dark-800"
      style="will-change: transform"
      on:submit|preventDefault|stopPropagation={() => {}}
      transition:fly={{ y: 10, duration: 400, easing: expoOut }}
    >
      <div class="flex space-x-8 justify-between">
        <div class="flex space-x-2 items-center">
          <UserProfile24 class="h-24px text-blue-500 w-24px" />
          <h4
            class="font-bold text-xl text-black leading-thight dark:text-white"
          >
            Invitar usuario a la localidad
          </h4>
        </div>
        <button
          type="button"
          on:click={() => {
            invitationDialog = false
          }}><Close24 /></button
        >
      </div>
      <div class="flex space-x-4 items-center">
        <label class="flex flex-col space-y-2 w-full">
          <span class="font-bold text-xs">Correo electrónico</span>
          <input
            class="bg-white border rounded border-gray-300 text-xs leading-tight w-full py-2 px-3 appearance-none dark:bg-dark-400 dark:border-dark-400 focus:outline-none focus:shadow-outline disabled:bg-gray-200 disabled:text-gray-500 disabled:dark:bg-dark-900"
            type="email"
            autocomplete="nooooope"
            aria-autocomplete="none"
            placeholder="Ej. pepito@gmail.com"
            required
          />
        </label>
      </div>
      {#if currentRole != 'facilitador'}
        <div class="flex space-x-4 items-center">
          <label class="flex flex-col space-y-2 w-full">
            <span class="font-bold text-xs">Rol</span>
            <select
              class="bg-white border rounded border-gray-300 text-xs leading-tight w-full py-2 px-3 appearance-none dark:bg-dark-400 dark:border-dark-400 focus:outline-none focus:shadow-outline disabled:bg-gray-200 disabled:text-gray-500 disabled:dark:bg-dark-900"
              placeholder="Ej. pepito@gmail.com"
              required
            >
              <option value="" hidden>Ej. Admin</option>
              {#if currentRole == 'administrador'}
                <option value="administrador">Owner</option>
              {/if}
              <option value="emprendedor">Admin</option>
              <option value="facilitador">Regular</option>
            </select>
          </label>
        </div>
      {/if}
      <div class="flex space-x-2 items-center justify-end">
        <button
          type="button"
          class="rounded font-bold ml-auto border-2 border-blue-500 text-xs py-1 px-2 text-blue-500 duration-200 disabled:cursor-not-allowed disabled:opacity-50 not-disabled:hover:bg-blue-500 not-disabled:hover:text-white"
          on:click={() => {
            invitationDialog = false
          }}>Cancelar</button
        >
        <button
          class="rounded font-bold ml-auto border-2 border-blue-500 text-xs py-1 px-2 text-blue-500 duration-200 disabled:cursor-not-allowed disabled:opacity-50 not-disabled:hover:bg-blue-500 not-disabled:hover:text-white"
          >Invitar</button
        >
      </div>
    </form>
  </div>
{/if}

<Main class="flex flex-col mx-auto space-y-6 w-full">
  <div class="flex w-full items-center justify-between">
    <div class="flex space-x-4 items-center">
      <UserMultiple24 />
      <h3 class="font-bold font-title text-black text-2xl dark:text-white">
        Miembros de la localidad
      </h3>
    </div>
  </div>
  <UsersList minimal />
</Main>
