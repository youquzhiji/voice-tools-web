<template>
  Hello World!

  <div class="drop-box unselectable">
    <span class="drop-label">Drop Here</span>
  </div>
</template>

<script setup lang="ts">

</script>

<style lang="sass">
.drop-box
  width: 100%
  height: 100px
  margin-top: 20px
  border: 5px dashed pink
  border-radius: 25px

  display: flex
  align-items: center
  justify-content: center

  .drop-label
    color: gray
    font-size: 1.5em

</style>
