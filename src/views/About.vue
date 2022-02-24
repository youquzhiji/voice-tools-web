<template>
  This is an about page.
</template>

<script setup lang="ts">
import {ref} from 'vue'
import * as tf from '@tensorflow/tfjs'

const signal = tf.tensor1d([1, 1, 1, 1, 0, 0, 0, 0])
signal.rfft().print()

</script>

<style lang="sass" scoped>

</style>
