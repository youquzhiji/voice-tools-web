<template>
  Hello World!

  <div class="drop-box unselectable" @dragover="(e) => e.preventDefault()" @drop="onDrop">
    <span class="drop-label">Drop Here</span>
  </div>
</template>

<script setup lang="ts">
import {ElMessage} from "element-plus";

function onDrop(e: DragEvent)
{
  // Prevent default behavior: Opening the file in a browser tab.
  e.preventDefault()

  // Read file data
  if (e.dataTransfer && e.dataTransfer.items)
  {
    // Loop through all files
    for (let i = 0; i < e.dataTransfer.items.length; i++)
    {
      // Check file type
      const item = e.dataTransfer.items[i]
      if (item.kind == 'file')
      {
        // Read file
        const file = item.getAsFile()!
        file.text().then(it => console.log(it))
      }
      else ElMessage.error(`Error: The item dropped must be a file, not a ${item.kind}`)
    }
  }
}
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
