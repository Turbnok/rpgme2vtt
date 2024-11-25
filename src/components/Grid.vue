<script setup lang="ts">
import { computed, onMounted, reactive, ref, useTemplateRef, watchEffect } from 'vue'
import { Walls } from '@/main'

interface Props {
  datas: Array<Walls>[]
}
const { datas } = defineProps<Props>()

const widthObj = computed(() => {
  return { width: `${datas[0] ? datas[0].length * 20 : 100}px` }
})
const getColor = (wall: Walls) => {
  let col
  switch (wall) {
    case Walls.DOOR:
      col = '#FF8899'
      break
    case Walls.FENCE:
      col = '#888899'
      break
    case Walls.WINDOW:
      col = '#8888DD'
      break
    case Walls.BASIC:
      col = '#555555'
      break
    default:
      col = '#EEEEEE '
  }
  return { backgroundColor: col }
}
</script>
<template>
  <div class="grid" :style="widthObj">
    <template v-for="(i, ide) in datas">
      <span v-for="(k, id) in i" :key="`${ide}-${id}`" :style="getColor(k)"></span>
    </template>
  </div>
</template>

<style>
.grid {
  line-height: 0px;
  box-sizing: border-box;
  span {
    display: inline-block;
    width: 20px;
    height: 20px;
    background-color: #eeeeee;
  }
}
</style>
