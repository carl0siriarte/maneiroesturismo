<script>
  let className
  export { className as class }
</script>

<div class={className} {...$$restProps}>
  <slot />
</div>

<style>
  div {
    padding: 1.5rem 5%;
  }
</style>
