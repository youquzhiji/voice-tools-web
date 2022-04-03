<template>
  <div id="Loading">
    <img src="../../css/loading.svg" alt="loading">
    <div class="text">Loading Meow~</div>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';

@Options({components: {}})
export default class Loading extends Vue
{
}
</script>

<style lang="sass" scoped>
#Loading
  width: 100%
  height: 100%
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  background: white
  opacity: 0.6

  img
    width: 150px

  .text
    margin-top: 20px
</style>
