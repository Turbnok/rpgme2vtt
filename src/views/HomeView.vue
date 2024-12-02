<script setup lang="ts">
import { ref, type Ref } from 'vue'
import Grid from '@/components/Grid.vue'
import ini from '@/datas/in.json'
import { Mode, Walls } from '@/main'
import Render from '@/components/Render.vue'
import { useDefaultStore } from '@/stores/default'
export type RPGme2 = typeof ini

const grid = ref<Array<Walls>[]>([])
const datas = ref<RPGme2 | null>(null)
const mode = ref(Mode.CLASSIC)
const image: Ref<ImageBitmap | undefined> = ref()
const defaultStore = useDefaultStore()

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
const onDownload = () => {
  const jsonData = JSON.stringify(defaultStore.output);
  const file = new Blob([jsonData], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = "rpgme2foundryvtt.json";
  a.click();
}
const onMode = () => {
  mode.value = mode.value == Mode.OUTLINED ? Mode.CLASSIC : Mode.OUTLINED
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
  if (files && files.length) {
    const file = files[0]
    if (file) {
      const bitmap: ImageBitmap = await createImageBitmap(file);
      image.value = bitmap
    }
  }
}
</script>
<template>
  <main>
    <div class="f">
      <div class="box">
        <Grid :datas="grid" />
        <label for="file">
          <span>Data</span>
          <br />
          <input name="file" v-on:change="onFile" type="file" />
        </label>
      </div>
      <div class="box">
        <Render :grid :datas :mode="mode" :image />
        <label for="image">
          <span>Image</span>
          <br />
          <input name="image" v-on:change="onImage" type="file" />
        </label>
      </div>
    </div>
    <div class="options">
      <label for="mode">
        <span>Outlined</span>
        <input name="mode" v-on:change="onMode" type="checkbox" />
        <input type="button" v-on:click="onDownload" value="download" />
      </label>
    </div>
  </main>
</template>
<style scoped>
.options {
  text-align: center;
  padding-bottom: 3rem;
}

label {
  display: block;
  margin-top: 1rem;
}

span {
  font-weight: bold;
}

.box {
  border: 1px solid #EEEEEE;
  padding: 1rem;
  margin: 0.5rem;
}

.f {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
</style>
