<script setup lang="ts">
import { computed, watch } from 'vue'
import { Walls } from '@/main'

interface Props {
  datas: Array<Walls>[]
}
const { datas } = defineProps<Props>()

const widthObj = computed(() => {
  return { width: `${datas[0] ? datas[0].length * 8 : 100}px` }
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
  <div class="cont">
    <div class="grid" key="grid" :style="widthObj">

      <template :key="`${ide}`" v-for="(i, ide) in datas">
        <span v-for="(k, id) in i" :key="`${ide}-${id}`" :style="getColor(k)"></span>
      </template>
    </div>
  </div>
</template>

<style>
.cont {

  min-width: 250px;
  min-height: 250px;
  text-align: center;
  background-color: #dddddd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid {
  line-height: 0px;
  box-sizing: border-box;
  background-color: #DDDDDD;

  span {
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: #eeeeee;
  }
}
</style>
