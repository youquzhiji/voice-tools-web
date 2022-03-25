<template>
  <div id="nav" class="fbox-h fcenter unselectable" @dragstart="e => e.preventDefault()">
    <router-link class="rlink" to="/">
      <i class="fa-solid fa-house"></i>
      <span>Home</span>
    </router-link>

    <router-link class="rlink" to="/about">
      <i class="fa-solid fa-circle-info"></i>
      <span>About</span>
    </router-link>
  </div>

  <!-- route outlet -->
  <!-- component matched by the route will render here -->
  <router-view></router-view>
</template>

<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import {Back} from "@element-plus/icons-vue";
</script>

<style lang="sass">
@import "css/colors"
@import "css/global"

#app
  font-family: Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  text-align: center
  color: #2c3e50
  background: #6a6464

  display: flex
  flex-direction: column
  height: 100%

  margin: auto

// Navigation bar
#nav
  width: 100%
  height: 50px
  background: #fff4eb

  flex-shrink: 0
  margin-bottom: 20px

  // Router link icon
  .rlink
    font-size: 18px
    text-decoration: none
    color: rgba(95, 55, 38, 0.78)

    display: flex
    flex-direction: column
    align-items: center
    justify-content: center

    padding: 4px 15px 0
    box-sizing: content-box
    border-bottom: 5px solid #ffe3be

    span
      font-size: 10px

  .rlink.router-link-active
    border-bottom: 5px solid #ff8373
    color: #ff8373

#nav:before, #nav:after
  content: ' '
  flex-grow: 1
  border-bottom: 5px solid #ffe3be
</style>
