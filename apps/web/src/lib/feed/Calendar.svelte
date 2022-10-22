<script lang="ts">
  import {
    ArrowRight24,
    ChevronLeft24,
    ChevronMini32,
    ChevronRight24,
    NextFilled24,
    ViewNext24,
    ViewOff24,
  } from 'carbon-icons-svelte'
  import CalendarDays from './CalendarDays.svelte'

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
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
  let headers: string[] = []
  let now = new Date()
  let year = now.getFullYear() //	this is the month & year displayed
  let month = now.getMonth()

  type Day = { name: string; enabled: boolean; date: Date }
  let days: Day[] = []

  function randInt(max: number) {
    return Math.floor(Math.random() * max) + 1
  }

  $: month, year, initContent()

  type Event = {
    title: string
    className: string
    date: Date
    len: number
    detailHeader?: string
    detailContent?: string
    isBottom?: boolean
    startCol?: number
    startRow?: number
  }
  let items: Event[] = []

  function initMonthItems() {
    let y = year
    let m = month
    let d1 = new Date(y, m, randInt(7) + 7)
    items = [
      {
        title: '11:00 Task Early in month',
        className: 'task--primary',
        date: new Date(y, m, randInt(6)),
        len: randInt(4) + 1,
      },
      {
        title: '7:30 Wk 2 tasks',
        className: 'task--warning',
        date: d1,
        len: randInt(4) + 2,
      },
      {
        title: 'Overlapping Stuff (isBottom:true)',
        date: d1,
        className: 'task--info',
        len: 4,
        isBottom: true,
      },
      {
        title: '10:00 More Stuff to do',
        date: new Date(y, m, randInt(7) + 14),
        className: 'task--info',
        len: randInt(4) + 9,
        detailHeader: 'Difficult',
        detailContent: 'But not especially so',
      },
      {
        title: 'All day task',
        date: new Date(y, m, randInt(7) + 21),
        className: 'task--danger',
        len: 1,
      },
    ]

    //This is where you calc the row/col to put each dated item
    for (let i of items) {
      let rc = findRowCol(i.date)
      if (rc == null) {
        console.log('didn`t find date for ', i)
        console.log(i.date)
        console.log(days)
        i.startCol = i.startRow = 0
      } else {
        i.startCol = rc.col
        i.startRow = rc.row
      }
    }
  }

  // choose what date/day gets displayed in each date box.
  function initContent() {
    headers = dayNames
    initMonth()
    initMonthItems()
  }

  function initMonth() {
    days = []
    let monthAbbrev = monthNames[month].slice(0, 3)
    let nextMonthAbbrev = monthNames[(month + 1) % 12].slice(0, 3)
    //	find the last Monday of the previous month
    var firstDay = new Date(year, month, 1).getDay()
    //console.log('fd='+firstDay+' '+dayNames[firstDay]);
    var daysInThisMonth = new Date(year, month + 1, 0).getDate()
    var daysInLastMonth = new Date(year, month, 0).getDate()
    var prevMonth = month == 0 ? 11 : month - 1

    //	show the days before the start of this month (disabled) - always less than 7
    for (let i = daysInLastMonth - firstDay; i < daysInLastMonth; i++) {
      let d = new Date(prevMonth == 11 ? year - 1 : year, prevMonth, i + 1)
      days.push({ name: '' + (i + 1), enabled: false, date: d })
    }
    //	show the days in this month (enabled) - always 28 - 31
    for (let i = 0; i < daysInThisMonth; i++) {
      let d = new Date(year, month, i + 1)
      if (i == 0)
        days.push({ name: monthAbbrev + ' ' + (i + 1), enabled: true, date: d })
      else days.push({ name: '' + (i + 1), enabled: true, date: d })
      //console.log('i='+i+'  dt is '+d+' date() is '+d.getDate());
    }
    //	show any days to fill up the last row (disabled) - always less than 7
    for (let i = 0; days.length % 7; i++) {
      let d = new Date(month == 11 ? year + 1 : year, (month + 1) % 12, i + 1)
      if (i == 0)
        days.push({
          name: nextMonthAbbrev + ' ' + (i + 1),
          enabled: false,
          date: d,
        })
      else days.push({ name: '' + (i + 1), enabled: false, date: d })
    }
  }

  function findRowCol(dt: Date) {
    for (let i = 0; i < days.length; i++) {
      let d = days[i].date
      if (
        d.getFullYear() === dt.getFullYear() &&
        d.getMonth() === dt.getMonth() &&
        d.getDate() === dt.getDate()
      )
        return { row: Math.floor(i / 7) + 2, col: (i % 7) + 1 }
    }
    return null
  }

  function next() {
    month++
    if (month == 12) {
      year++
      month = 0
    }
  }
  function prev() {
    if (month == 0) {
      month = 11
      year--
    } else {
      month--
    }
  }
</script>

<div class="flex flex-col w-full">
  <div
    class="border-b flex space-x-2 border-gray-300 text-lg w-full py-6 items-center justify-center dark:border-dark-100"
  >
    <button class="flex" on:click={() => year--}> &Lt; </button>
    <button class="flex" on:click={prev}> &lt; </button>
    <span class="font-bold text-xl px-2">
      {monthNames[month]},
      {year}
    </span>
    <button class="flex" on:click={next}> &gt; </button>
    <button class="flex" on:click={() => year++}> &Gt; </button>
  </div>
  <CalendarDays {headers} {days} {items} />
</div>
