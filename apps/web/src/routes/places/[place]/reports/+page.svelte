<script lang="ts">
  import Posts from '$lib/feed/Posts.svelte'
  import Main from '$lib/__layouts/app/shell/Main.svelte'
  import {
    UserMultiple24,
    UserProfile16,
    UserProfile24,
  } from 'carbon-icons-svelte'
  import { portal } from 'svelte-portal'
  import { expoOut } from 'svelte/easing'
  import { fade, fly } from 'svelte/transition'
  let invitationDialog = false
</script>

<Main class="flex flex-col mx-auto space-y-6 w-full">
  <div class="flex w-full items-center justify-between">
    <div class="flex space-x-4 items-center">
      <UserMultiple24 />
      <h3 class="font-bold font-title text-black text-2xl dark:text-white">
        Reportes de la localidad
      </h3>
    </div>
  </div>
  <div class="w-full">
    <div class="mx-auto w-full grid gap-6 grid-cols-1 sm:grid-cols-4">
      <div
        class="bg-white border rounded-lg flex flex-col border-gray-300 text-right w-full p-4 transform transition-transform duration-200 dark:bg-dark-700 dark:border-dark-100 hover:scale-98"
        style:will-change="transform"
      >
        <h4 class="font-bold text-lg">Posts publicados:</h4>
        <p class="font-bold text-4xl">100</p>
      </div>
      <div
        class="bg-white border rounded-lg flex flex-col border-gray-300 text-right w-full p-4 transform transition-transform duration-200 dark:bg-dark-700 dark:border-dark-100 hover:scale-98"
        style:will-change="transform"
      >
        <h4 class="font-bold text-lg">Posts comentados:</h4>
        <p class="font-bold text-4xl">100</p>
      </div>
      <div
        class="bg-white border rounded-lg flex flex-col border-gray-300 text-right w-full p-4 transform transition-transform duration-200 dark:bg-dark-700 dark:border-dark-100 hover:scale-98"
        style:will-change="transform"
      >
        <h4 class="font-bold text-lg">Posts sin comentar:</h4>
        <p class="font-bold text-4xl">100</p>
      </div>
      <div
        class="bg-white border rounded-lg flex flex-col border-gray-300 text-right w-full p-4 transform transition-transform duration-200 dark:bg-dark-700 dark:border-dark-100 hover:scale-98"
        style:will-change="transform"
      >
        <h4 class="font-bold text-lg">Eventos publicados:</h4>
        <p class="font-bold text-4xl">100</p>
      </div>
    </div>
  </div>
  <div class="flex-col flex mx-auto space-y-4 w-full pt-8 lg:w-8/10">
    <div class="flex space-x-4 items-center">
      <h3 class="font-bold font-title text-black text-2xl dark:text-white">
        Post con más comentarios
      </h3>
    </div>
    <Posts />
  </div>
  <div class="flex-col flex mx-auto space-y-4 w-full lg:w-8/10">
    <div class="flex space-x-4 items-center">
      <h3 class="font-bold font-title text-black text-2xl dark:text-white">
        Post con más me gustas
      </h3>
    </div>
    <Posts />
  </div>
</Main>
