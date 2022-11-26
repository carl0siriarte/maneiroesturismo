<script>
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import Feed from '$lib/feed/Feed.svelte'
  /** @type {import('./$types').PageData} */
  export let data
</script>

<Feed
  spa
  editable
  post={data.post}
  on:closePostModal={() => {
    goto($page.url.pathname, { noScroll: true })
  }}
/>
