<script lang="ts">
  import Posts from '$lib/feed/Posts.svelte'
  import Main from '$lib/__layouts/app/shell/Main.svelte'
  import Chart from './Chart.svelte'
  import { Printer16, ReportData24 } from 'carbon-icons-svelte'
  import type { PageData } from './$types'

  export let data: PageData
</script>

<Main class="flex flex-col mx-auto space-y-6 w-full print">
  <div class="flex flex-col space-y-6 print:min-h-100vh">
    <div class="flex mx-auto w-full items-center justify-between lg:w-8/10">
      <div class="flex space-x-4 items-center print">
        <ReportData24 />
        <h3
          class="font-bold font-title text-black text-2xl print dark:text-white"
        >
          Reportes de la localidad
        </h3>
      </div>
      <button
        class="rounded-lg flex font-bold space-x-2 border-2 border-blue-500 text-sm text-xs py-2 px-2 transform-gpu text-blue-500 duration-200 items-center print:hidden hover:shadow disabled:cursor-not-allowed disabled:opacity-70 not-disabled:hover:scale-95"
        type="button"
        on:click={() => window.print()}
      >
        <Printer16 class="flex" />
        <span>Imprimir reportes</span>
      </button>
    </div>
    <div class="w-full">
      <div
        class="mx-auto w-full grid gap-6 grid-cols-1 print:grid-cols-3 sm:grid-cols-3 lg:w-8/10 "
      >
        <div
          class="bg-white border rounded-lg flex flex-col border-gray-300 text-right w-full p-4 transform transition-transform duration-200 dark:bg-dark-700 dark:border-dark-100 hover:scale-98"
          style:will-change="transform"
        >
          <h4 class="font-bold text-lg print:text-sm">Posts publicados</h4>
          <p class="font-bold text-4xl print:text-xl">
            {data.reports.posts.total}
          </p>
        </div>
        <div
          class="bg-white border rounded-md flex flex-col border-gray-300 text-right w-full p-4 transform transition-transform duration-200 dark:bg-dark-700 dark:border-dark-100 hover:scale-98"
          style:will-change="transform"
        >
          <h4 class="font-bold text-lg print:text-sm">
            Posts con interacciones
          </h4>
          <p class="font-bold text-4xl print:text-xl">
            {data.reports.posts.withInteractions}
          </p>
        </div>
        <div
          class="bg-white border rounded-md flex flex-col border-gray-300 text-right w-full p-4 transform transition-transform duration-200 dark:bg-dark-700 dark:border-dark-100 hover:scale-98"
          style:will-change="transform"
        >
          <h4 class="font-bold text-lg print:text-sm">
            Posts sin interacciones
          </h4>
          <p class="font-bold text-4xl print:text-xl">
            {data.reports.posts.withoutInteractions}
          </p>
        </div>

        <div
          class="bg-white border rounded-md flex flex-col border-gray-300 text-right w-full p-4 transform transition-transform duration-200 dark:bg-dark-700 dark:border-dark-100 hover:scale-98"
          style:will-change="transform"
        >
          <h4 class="font-bold text-lg print:text-sm">Eventos publicados</h4>
          <p class="font-bold text-4xl print:text-xl">
            {data.reports.events.total}
          </p>
        </div>
        <div
          class="bg-white border rounded-md flex flex-col border-gray-300 text-right w-full p-4 transform transition-transform duration-200 dark:bg-dark-700 dark:border-dark-100 hover:scale-98"
          style:will-change="transform"
        >
          <h4 class="font-bold text-lg print:text-sm">
            Eventos con interacciones
          </h4>
          <p class="font-bold text-4xl print:text-xl">
            {data.reports.events.withInteractions}
          </p>
        </div>
        <div
          class="bg-white border rounded-md flex flex-col border-gray-300 text-right w-full p-4 transform transition-transform duration-200 dark:bg-dark-700 dark:border-dark-100 hover:scale-98"
          style:will-change="transform"
        >
          <h4 class="font-bold text-lg print:text-sm">
            Eventos sin interacciones
          </h4>
          <p class="font-bold text-4xl print:text-xl">
            {data.reports.events.withoutInteractions}
          </p>
        </div>
      </div>
    </div>
    <div class="flex-col flex mx-auto space-y-4 w-full py-8 lg:w-8/10">
      <div class="flex space-x-4 items-center">
        <h3 class="font-bold font-title text-black text-2xl dark:text-white">
          Post con más "Me gusta"
        </h3>
      </div>
      <Posts
        ids={[data.reports.posts.withMoreInteractions || '']}
        showMoreButton={false}
      />
    </div>
  </div>
  <div class="flex-col flex mx-auto space-y-4 w-full lg:w-8/10">
    <div class="flex space-x-4 items-center">
      <h3 class="font-bold font-title text-black text-2xl dark:text-white">
        Asistencias a eventos en los últimos 6 meses
      </h3>
    </div>
    <Chart />
  </div>
</Main>
