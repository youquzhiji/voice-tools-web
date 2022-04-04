<template>
  <div id="about" class="card shadow">
    This is an about page.
  </div>
</template>

<script setup lang="ts">
import * as tf from '@tensorflow/tfjs'

const signal = tf.tensor1d([1, 1, 1, 1, 0, 0, 0, 0])
signal.rfft().print()

</script>

<style lang="sass" scoped>
#about
  max-width: 600px
  width: 100%
  height: 100%
  margin: 20px auto 40px
  padding: 20px
</style>
