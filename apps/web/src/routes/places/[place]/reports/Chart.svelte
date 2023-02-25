<script lang="ts">
  import Chart from '@sveltejs/pancake/components/Chart.svelte'
  import Svg from '@sveltejs/pancake/components/Svg.svelte'
  import SvgLine from '@sveltejs/pancake/components/SvgLine.svelte'
  import Grid from '@sveltejs/pancake/components/Grid.svelte'
  import Point from '@sveltejs/pancake/components/Point.svelte'
  import Quadtree from '@sveltejs/pancake/components/Quadtree.svelte'
  import { trpc } from '$lib/trpc/client'
  import { pageContext } from '$lib'
  import type { RouterTypes } from '@pkg/trpc'
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'

  let x1 = +Infinity
  let x2 = -Infinity
  let y1 = +Infinity
  let y2 = -Infinity

  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ]

  let reports: RouterTypes['reports']['get']['output'] | undefined

  onMount(() => {
    if (browser) {
      initData()
    }
  })

  async function initData() {
    reports = await trpc.reports.get.mutate(
      $pageContext.context.place?.id || ''
    )
    reports?.confirmations.forEach((d) => {
      if (+d.date < x1) x1 = +d.date
      if (+d.date > x2) x2 = +d.date
      if (d.value < y1) y1 = d.value
      if (d.value > y2) y2 = d.value
    })
  }

  let closest: { date: Date; x: number; y: number } | undefined

  $: points =
    reports?.confirmations.map((data) => ({
      date: data.date,
      x: +data.date,
      y: data.value,
    })) || []
</script>

<div class="chart">
  <Chart {x1} {x2} {y1} {y2}>
    <Grid horizontal count={5} let:value>
      <div class="grid-line horizontal"><span>{value}</span></div>
    </Grid>

    <Grid vertical count={6} ticks={points.map((p) => p.x)} let:value>
      {@const date = new Date(value)}
      <span class="x-label <sm:hidden !print:inline"
        >{monthNames[date.getMonth()]}</span
      >
    </Grid>

    <Svg>
      <SvgLine data={points} let:d>
        <path class="data" {d} />
      </SvgLine>

      {#if closest}
        <SvgLine data={points} let:d>
          <path class="highlight dark:bg-dark-900" {d} />
        </SvgLine>
      {/if}
    </Svg>

    {#if closest}
      <Point x={closest.x} y={closest.y}>
        <span class="annotation-point" />
        <div
          class="annotation"
          style="transform: translate(-{100 *
            ((closest.x - x1) / (x2 - x1))}%,0)"
        >
          <strong
            >{monthNames[closest.date.getMonth()]}
            {closest.date.getFullYear()}</strong
          >
          <span>{closest.y} asistencias</span>
        </div>
      </Point>
    {/if}

    <Quadtree data={points} bind:closest />
  </Chart>
</div>

<style>
  .chart {
    height: 400px;
    padding: 3em 0 2em 2em;
    margin: 0 0 36px 0;
  }

  .grid-line {
    position: relative;
    display: block;
  }

  .grid-line.horizontal {
    width: calc(100% + 2em);
    left: -2em;
    @apply border border-dashed border-b-gray-300;
  }

  :global(.dark) .grid-line.horizontal {
    @apply border-dark-100;
  }

  .grid-line span {
    position: absolute;
    left: 0;
    bottom: 2px;
    font-size: 14px;
    color: #999;
  }

  .x-label {
    position: absolute;
    width: 4em;
    left: -2em;
    bottom: -32px;
    color: #999;
    text-align: center;
    @apply text-xs;
  }

  path.data {
    @apply text-blue-500;
    stroke: currentColor;
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-width: 1px;
    fill: none;
  }

  .highlight {
    @apply text-blue-500;
    stroke: currentColor;
    fill: none;
    stroke-width: 4;
  }

  .annotation {
    position: absolute;
    white-space: nowrap;
    bottom: 1em;
    line-height: 1.2;
    padding: 0.2em 0.4em;
    @apply bg-white border rounded border-gray-300 shadow-xl;
  }

  :global(.dark) .annotation {
    @apply bg-dark-800 border-dark-100;
  }

  .annotation-point {
    position: absolute;
    width: 14px;
    height: 14px;
    @apply bg-blue-500;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  .annotation strong {
    display: block;
    font-size: 20px;
  }

  .annotation span {
    display: block;
    font-size: 14px;
  }
</style>
