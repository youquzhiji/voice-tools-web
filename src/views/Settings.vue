<template>
  <div id="Settings" class="card shadow">
    <div id="text">
      <div id="title">Settings</div>
      <div id="subtitle">You can toggle things here!</div>
    </div>

    <div id="options">
      <div v-for="option of options" :class="getClass(option)">
        <div class="desc" v-html="marked(option.desc)" />

        <div v-if="option.type === 'boolean'">
          <el-switch v-model="option.val" active-color="pink"/>
        </div>

        <div v-if="option.type === 'string'">
          <hy-input v-model="option.val" />
        </div>

        <div class="modified-text" v-if="option.modified">
          <span>Modified!</span> <span>Default is <code>{{option.def}}</code></span>
        </div>
      </div>
    </div>

    <el-button type="danger" plain round @click="reset">Reset</el-button>
  </div>
</template>

<script lang="ts">
import {options, Setting} from '@/js/Setting';
import {Options, Vue} from 'vue-class-component';
import {marked} from 'marked';
import HyInput from "@/views/comp/HyInput.vue";
import {ElMessageBox} from "element-plus";
import {ref} from "vue";

@Options({components: {HyInput}})
export default class Settings extends Vue
{
  // options = options.map(it => ref(it))
  options = options
  marked = marked

  getClass<T>(option: Setting<T>)
  {
    const cls = {'modified': option.modified}
    cls[option.type] = true
    return cls
  }

  reset()
  {
    ElMessageBox.confirm('Do you really want to reset?')
        .then(() => {
          options.forEach(it => it.reset())
          this.$forceUpdate()
        })
  }
}
</script>

<style lang="sass" scoped>
#Settings
  width: 100%
  max-width: 600px
  margin: 20px auto 0
  padding: 20px

  > * + *
    margin-top: 20px

  #text
    #title
      font-size: 1.2em

    #subtitle
      font-size: 0.8em

  #options
    text-align: left
    .desc
      margin-bottom: 0
      font-size: 0.9em

  .modified-text
    margin-top: 5px
    font-size: 0.8em
    color: #9f9f9f

    code
      padding: 0.2em 0.4em
      margin: 0
      background-color: rgb(175 184 193 / 20%)
      border-radius: 6px

    span:first-child
      color: red

</style>

<style lang="sass">
#Settings #options .desc
  p
    margin-bottom: 5px
</style>
