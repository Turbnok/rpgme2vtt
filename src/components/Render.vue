<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch, watchEffect } from 'vue'
import { Mode, Walls } from '@/main'
import type { RPGme2 } from '@/views/HomeView.vue'
import { useDefaultStore } from '@/stores/default'
import scene from '@/datas/helloscene.json'
const defaultStore = useDefaultStore()
interface Props {
  grid: Array<Walls>[]
  datas: RPGme2 | null
  mode: Mode
  image: ImageBitmap | undefined
}
const walle = {
  light: 40,
  sight: 20,
  sound: 20,
  move: 20,
  c: [],
  _id: '',
  dir: 0,
  door: 0,
  ds: 0,
}

const { grid, datas, mode, image } = defineProps<Props>()

const of = ref(0.0)
const size = 25
const basicWalls = ref<number[][]>([])

const windows = ref<Array<number>[]>([])
const doors = ref<Array<number>[]>([])
const fences = ref<Array<number>[]>([])
const canvas = useTemplateRef('can')

let ctx: CanvasRenderingContext2D | null
let o = false
const width = computed(() => {
  if (grid[0]) {
    return grid[0].length * size
  } else if (image) {
    return image.width / 2 + 50
  }
  return 200
})
const height = computed(() => {
  if (grid.length) {
    return grid.length * size
  } else if (image) {
    return image.height / 2 + 50
  }
  return 200
})

onMounted(() => {
  if (canvas && canvas.value) {
    ctx = canvas.value.getContext('2d')
  }
})

const shrinks = [
  [1, 1],
  [-1, 1],
  [-1, -1],
  [1, -1],
]
watch(
  () => [mode, image],
  () => {
    setTimeout(() => {
      redraw()
    }, 16)
  },
)
watch(
  () => grid,
  () => {
    setTimeout(() => {
      redraw()
    }, 16)
  },
)
watch(of, () => {
  redraw()
})
const redraw = () => {
  basicWalls.value = []
  windows.value = []
  doors.value = []
  fences.value = []
  switch (mode) {
    case Mode.CLASSIC:
      basicWalls.value = generateWalls(grid, Walls.BASIC)
      break
    case Mode.OUTLINED:
      generateOutlines(grid)
      break
  }
  generateWindows(datas, grid)
  fences.value = generateWalls(grid, Walls.FENCE)
  draw()
}
const above = (x: number, y: number, g: Array<Walls>[]) => {
  return y != 0 && g[y - 1][x] == Walls.BASIC
}
const before = (x: number, y: number, g: Array<Walls>[]) => {
  return x != 0 && g[y][x - 1] == Walls.BASIC
}
const after = (x: number, y: number, g: Array<Walls>[]) => {
  return g[y][x + 1] == Walls.BASIC
}
const addPointC = (x: number, y: number, shrink: number) => {
  if (!o) {
    basicWalls.value.push([
      x + 1 + shrinks[shrink][0] * of.value,
      y + shrinks[shrink][1] * of.value,
      -1,
      -1,
    ])
  } else {
    basicWalls.value[basicWalls.value.length - 1][2] = x + 1 + shrinks[shrink][0] * of.value
    basicWalls.value[basicWalls.value.length - 1][3] = y + shrinks[shrink][1] * of.value
  }
  o = !o
}
const addPointL = (x: number, y: number, shrink: number) => {
  if (!o) {
    basicWalls.value.push([
      x + shrinks[shrink][0] * of.value,
      y + shrinks[shrink][1] * of.value,
      -1,
      -1,
    ])
  } else {
    basicWalls.value[basicWalls.value.length - 1][2] = x + shrinks[shrink][0] * of.value
    basicWalls.value[basicWalls.value.length - 1][3] = y + shrinks[shrink][1] * of.value
  }
  o = !o
}
const generateWindows = (datas: RPGme2 | null, g: Array<Walls>[]) => {
  if (!g.length) return
  if (!datas) return
  const vi = 0.0
  datas.objects.forEach((o) => {
    let point
    try {
      if (o.w > o.h || g[o.y + 1][o.x - 1 + 1] == Walls.BASIC) {
        point = [o.x + 1 - vi, o.y + 1.5, o.x + o.w + 1 + vi, o.y + o.h + 0.5]
      } else {
        point = [o.x + 1.5, o.y + 1 - vi, o.x + o.w + 0.5, o.y + o.h + 1 + vi]
      }
      if (o.t.id == 10) {
        windows.value.push(point)
      } else if (o.t.id == 2) {
        doors.value.push(point)
      }
    } catch (error) {
      console.log(o)
    }
  })
}
const adjustx = (line: number[], g: Walls[][]): number[] => {
  const vi = 0.5
  let x1 = line[0]
  const y1 = line[1]
  let x2 = line[2]
  const y2 = line[3]
  const t1 = g[y1][x1]

  if (g[y1][x1 - 1] != Walls.NONE && (g[y1][x1 - 1] != Walls.BASIC || t1 == Walls.FENCE)) {
    x1 -= vi
  }
  x1 += vi
  if (g[y2][x2 + 1] != Walls.NONE && (g[y2][x2 + 1] != Walls.BASIC || t1 == Walls.FENCE)) {
    x2 += vi
  }
  x2 += vi
  return [x1, y1 + vi, x2, y2 + vi]
}
const adjusty = (col: number[], g: Walls[][]): number[] => {
  const vi = 0.5
  const x1 = col[0]
  let y1 = col[1]
  const x2 = col[2]
  let y2 = col[3]
  const t1 = g[y1][x1]

  if (g[y1 - 1][x1] != Walls.NONE && (g[y1 - 1][x1] != Walls.BASIC || t1 == Walls.FENCE)) {
    y1 -= vi
  }
  y1 += vi
  if (g[y2 + 1][x2] != Walls.NONE && (g[y2 + 1][x2] != Walls.BASIC || t1 == Walls.FENCE)) {
    y2 += vi
  }

  y2 += vi

  return [x1 + vi, y1, x2 + vi, y2]
}
const generateWalls = (g: Array<Walls>[], wallType: Walls): Array<Array<number>> => {
  if (!g.length) return []
  const a = []
  const h = g.length - 1
  const w = g[0].length - 1
  for (let r = 0; r <= h; r++) {
    let c
    for (c = 0; c <= w; c++) {
      if (g[r][c] == wallType) {
        let n = 0
        while (
          g[r][c + n + 1] == wallType &&
          (g[r - 1][c + n] != wallType ||
            g[r + 1][c + n] != wallType ||
            g[r - 1][c + n + 1] != wallType ||
            g[r + 1][c + n + 1] != wallType)
        ) {
          n++
        }
        const row = adjustx([c, r, c + n, r], g)
        if (row[2] - row[0] == 0) continue
        a.push(row)
        c += n
      }
    }
  }

  for (let c = 0; c <= w; c++) {
    let r
    for (r = 0; r <= h; r++) {
      if (g[r][c] == wallType) {
        let n = 0
        while (
          g[r + n + 1][c] == wallType &&
          (g[r + n][c + 1] != wallType ||
            g[r + n][c - 1] != wallType ||
            g[r + n + 1][c - 1] != wallType ||
            g[r + n + 1][c + 1] != wallType)
        ) {
          n++
        }

        const col = adjusty([c, r, c, r + n], g)
        if (col[3] - col[1] == 0) continue
        a.push(col)
        r += n
      }
    }
  }
  return a
}

const generateOutlines = (g: Array<Walls>[]) => {
  if (!g.length) return
  const h = g.length - 1
  const w = g[0].length - 1
  for (let r = 0; r <= h; r++) {
    let c
    for (c = 0; c <= w; c++) {
      if (g[r][c] == Walls.BASIC) {
        if (!o) {
          if (!above(c, r, g)) {
            if (before(c, r, g)) {
              addPointL(c, r, 1)
            } else {
              addPointL(c, r, 0)
            }
          }
        } else {
          if (!before(c, r, g)) {
            if (!above(c, r, g)) {
              addPointL(c, r, 2)
              addPointL(c, r, 0)
            } else {
              addPointL(c, r, 3)
            }
          } else if (above(c, r, g)) {
            addPointL(c, r, 0)
          }
        }
      } else {
        if (!o) {
          if (above(c, r, g)) {
            if (before(c, r, g)) {
              addPointL(c, r, 2)
            } else {
              addPointL(c, r, 3)
            }
          }
        } else {
          if (before(c, r, g)) {
            addPointL(c, r, 1)
            if (above(c, r, g)) {
              addPointL(c, r, 3)
            }
          } else if (!above(c, r, g)) {
            addPointL(c, r, 2)
          }
        }
      }
    }
  }
  for (let c = 0; c <= w; c++) {
    let r
    for (r = 0; r <= h; r++) {
      if (g[r][c] == Walls.BASIC) {
        if (!o) {
          //1er
          if (!after(c, r, g)) {
            if (above(c, r, g)) {
              addPointC(c, r, 2)
            } else {
              addPointC(c, r, 1)
            }
          }
        } else {
          if (!above(c, r, g)) {
            if (!after(c, r, g)) {
              addPointC(c, r, 3)
              addPointC(c, r, 1)
            } else {
              addPointC(c, r, 0)
            }
          } else if (after(c, r, g)) {
            addPointC(c, r, 1)
          }
        }
      } else {
        if (!o) {
          if (after(c, r, g)) {
            if (above(c, r, g)) {
              addPointC(c, r, 3)
            } else {
              addPointC(c, r, 0)
            }
          }
        } else {
          if (above(c, r, g)) {
            if (after(c, r, g)) {
              addPointC(c, r, 2)
              addPointC(c, r, 0)
            } else {
              addPointC(c, r, 2)
            }
          } else if (!after(c, r, g)) {
            addPointC(c, r, 3)
          }
        }
      }
    }
  }
}
const walls: Walls[] = []
const addWall = (wall: number[], type: Walls) => {
  const w = JSON.parse(JSON.stringify(walle))
  w.c = [(wall[0] - 1) * 50, (wall[1] - 1) * 50, (wall[2] - 1) * 50, (wall[3] - 1) * 50]
  w.threshold = {
    light: null,
    sight: null,
    sound: null,
    attenuation: false,
  }
  switch (type) {
    case Walls.BASIC:
      w.light = w.sight = w.sound = w.move = 20
      break
    case Walls.FENCE:
      w.light = w.sight = w.sound = 0
      w.move = 20
      break
    case Walls.DOOR:
      w.light = w.sight = w.sound = w.move = 20
      w.door = 1
      break
    case Walls.WINDOW:
      w.light = w.sight = 30
      w.sound = w.move = 20
      w.threshold.light = w.threshold.sight = 4
      w.attenuation = true
      break
  }

  walls.push(w)

  // draw
  if (ctx) {
    ctx.beginPath()
    // ctx.strokeStyle = '#ffffbb'
    //ctx.strokeStyle = '#00000055'

    ctx.lineWidth = 3
    ctx.moveTo(wall[0] * size, wall[1] * size)
    ctx.lineTo(wall[2] * size, wall[3] * size)
    ctx.stroke()
    ctx.closePath()
    /*
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.strokeStyle = '#ff0000'
    ctx.rect(wall[0] * size - 4, wall[1] * size - 4, 8, 8)
    ctx.stroke()
    ctx.closePath()

    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.strokeStyle = '#00ff00'
    ctx.rect(wall[2] * size - 2, wall[3] * size - 2, 4, 4)
    ctx.stroke()
    ctx.closePath()
    */
  }
}
const draw = () => {
  if (!ctx) return

  ctx.clearRect(0, 0, width.value, height.value)
  if (image) {
    ctx.drawImage(image, 25, 25, image.width / 2, image.height / 2)
  }
  ctx.lineWidth = 3
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  basicWalls.value.forEach((a: Array<number>) => {
    if (!ctx) return
    ctx.strokeStyle = '#ffffbb'
    addWall(a, Walls.BASIC)
  })
  fences.value.forEach((a: Array<number>) => {
    if (!ctx) return
    ctx.strokeStyle = '#77e7e8'
    addWall(a, Walls.FENCE)
  })
  windows.value.forEach((a: Array<number>) => {
    if (!ctx) return
    ctx.strokeStyle = '#c7d8ff'
    addWall(a, Walls.WINDOW)
  })
  doors.value.forEach((a: Array<number>) => {
    if (!ctx) return
    ctx.strokeStyle = '#6666ee'
    addWall(a, Walls.DOOR)
  })

  const scen = JSON.parse(JSON.stringify(scene))
  scen.width = grid[0].length * 50
  scen.height = grid.length * 50
  scen.padding = 0
  scen.walls = walls

  defaultStore.output = scen
}

/*
const ligths = [];
const drawLights = (lis) => {
  lis.forEach((l) => {
    ctx.beginPath();
    ctx.arc(
      l.x * size + size / 2,
      l.y * size + size / 2,
      5,
      0,
      2 * Math.PI,
      false
    );
    ctx.stroke();
    ctx.closePath();
  });
};

*/
</script>
<template>
  <div class="col">
    <canvas ref="can" :width="`${width}px`" :height="`${height}px`"></canvas>
  </div>
</template>

<style>
.canvasImage {
  background-color: transparent;
  position: absolute;
  top: -25px;
  left: -25px;
}

.col {
  min-width: 315px;
  min-height: 315px;
  box-sizing: border-box;
  position: relative;
  border: 1px solid #dddddd;
  background-color: #dddddd;
  padding: 0rem;
  display: flex;
  flex-direction: column;
}
</style>
