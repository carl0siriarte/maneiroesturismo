<script>
  import { pageContext } from '$lib'
  import { Map24 } from 'carbon-icons-svelte'
</script>

<div class="flex flex-col space-y-6 w-full">
  <div class="flex space-x-4 w-full items-center">
    <Map24 />
    <h2 class="font-bold font-title text-black text-2xl dark:text-white ">
      {$pageContext.context.place?.name}
    </h2>
  </div>
</div>
