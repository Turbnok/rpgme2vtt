<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue'
import Grid from '@/components/Grid.vue'
import ini from '@/datas/in.json'
import { Mode, Walls } from '@/main'
import Render from '@/components/Render.vue'
export type RPGme2 = typeof ini

const grid = ref<Array<Walls>[]>([])
const datas = ref<RPGme2 | null>(null)
const mode = ref(Mode.OUTLINED)
const download = useTemplateRef('download')
const toggle = useTemplateRef('toggle')
const image = ref()
const wall = {
  light: 40,
  sight: 20,
  sound: 20,
  move: 20,
  c: [0, 1725, 2237, 1787],
  _id: '',
  dir: 0,
  door: 0,
  ds: 0,
  threshold: {
    light: null,
    sight: null,
    sound: null,
    attenuation: false,
  },
  flags: {},
}

const initGrid = (data: RPGme2, g: Array<Walls>[]) => {
  const w = data.w
  const h = data.h
  datas.value = data
  const d = data.collisions
  for (let r = 0; r < h + 2; r++) {
    g[r] = []
    for (let c = 0; c < w + 2; c++) {
      g[r][c] = Walls.NONE
    }
  }
  d.forEach((a) => {
    const id: number = parseInt(a.split(':')[0])
    const cr: number = Math.floor(id / w) + 1
    const cw: number = Math.floor(id % w) + 1
    g[cr][cw] = Walls.BASIC
  })
  data.objects.forEach((a) => {
    switch (a.t.id) {
      case 2:
        for (let i = 0; i < a.w; i++) g[a.y + 1][a.x + 1 + i] = Walls.DOOR
        for (let i = 0; i < a.h; i++) g[a.y + 1 + i][a.x + 1] = Walls.DOOR
        break
      case 3:
        g[a.y + 1][a.x + 1] = Walls.FENCE
        break
      case 10:
        for (let i = 0; i < a.w; i++) g[a.y + 1][a.x + 1 + i] = Walls.WINDOW
        for (let i = 0; i < a.h; i++) g[a.y + 1 + i][a.x + 1] = Walls.WINDOW
        break
    }
  })
}
const onMode = () => {
  console.log('on mode ?')
  if (mode.value == Mode.OUTLINED) {
    mode.value = Mode.CLASSIC
  } else {
    mode.value = Mode.OUTLINED
  }
}
const onFile = async (e: Event) => {
  const files = (<HTMLInputElement>e.target).files
  grid.value = []
  if (files && files.length) {
    const response = await files[0].text()
    const json = JSON.parse(response)

    initGrid(json, grid.value)
  }
}
const onImage = async (e: Event) => {
  const files = (<HTMLInputElement>e.target).files
  const reader = new FileReader()
  reader.onloadend = function () {
    image.value = reader.result
  }
  grid.value = []
  if (files && files.length) {
    const file = await files[0]
    if (file) {
      reader.readAsDataURL(file)
    }
  }
}
</script>

<template>
  <main>
    <input v-on:change="onFile" type="file" />
    <input v-on:change="onImage" type="file" />
    <input v-on:change="onMode" type="checkbox" />
    <button ref="download">download</button>

    <div class="f">
      <Grid :datas="grid" />
      <Render :grid :datas :mode :image />
    </div>
  </main>
</template>
<style scoped>
.f {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
</style>
