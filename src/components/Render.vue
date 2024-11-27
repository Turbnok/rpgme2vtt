<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch, watchEffect } from 'vue'
import { Walls } from '@/main'
import type { RPGme2 } from '@/views/HomeView.vue'

interface Props {
  grid: Array<Walls>[]
  datas: RPGme2 | null
}
const { grid, datas } = defineProps<Props>()
const slider = useTemplateRef('slider')
const of = ref(0.47)
const size = 12
const lines = ref<number[][]>([])
const cols = ref<Array<number>[]>([])
const windows = ref<Array<number>[]>([])
const doors = ref<Array<number>[]>([])
const fences = ref<Array<number>[]>([])
const canvas = useTemplateRef('can')

let ctx: CanvasRenderingContext2D | null
let o = false
const width = computed(() => (grid[0] ? grid[0].length * size : 1))
const height = computed(() => (grid ? grid.length * size : 1))
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
watch(of, () => {
  console.log('offf ?')
  lines.value = []
  cols.value = []
  windows.value = []
  doors.value = []
  fences.value = []
  generateWalls(grid)
  generateWindows(datas, grid)
  generateFences(grid)

  drawWalls(lines.value, cols.value)
})

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
    cols.value.push([
      x + 1 + shrinks[shrink][0] * of.value,
      y + shrinks[shrink][1] * of.value,
      -1,
      -1,
    ])
  } else {
    cols.value[cols.value.length - 1][2] = x + 1 + shrinks[shrink][0] * of.value
    cols.value[cols.value.length - 1][3] = y + shrinks[shrink][1] * of.value
  }
  o = !o
}

const addPointL = (x: number, y: number, shrink: number) => {
  if (!o) {
    lines.value.push([x + shrinks[shrink][0] * of.value, y + shrinks[shrink][1] * of.value, -1, -1])
  } else {
    lines.value[lines.value.length - 1][2] = x + shrinks[shrink][0] * of.value
    lines.value[lines.value.length - 1][3] = y + shrinks[shrink][1] * of.value
  }
  o = !o
}
const generateWindows = (datas: RPGme2 | null, g: Array<Walls>[]) => {
  if (!datas) return
  const vi = 0.0
  datas.objects.forEach((o) => {
    let point
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
  })
}
const generateFences = (g: Array<Walls>[]) => {
  const h = g.length - 1
  const w = g[0].length - 1
  for (let r = 0; r <= h; r++) {
    let c
    for (c = 0; c <= w; c++) {
      if (g[r][c] == Walls.FENCE && g[r][c - 1] != Walls.FENCE) {
        let n = 0
        while (g[r][c + n] == Walls.FENCE) {
          n++
        }
        const row = [c, r + 0.5, c + n, r + 0.5]
        if (g[r][c - 1] == Walls.NONE && (g[r - 1][c] != Walls.NONE || g[r + 1][c] != Walls.NONE)) {
          row[0] += 0.5
        }
        if (
          g[r][c + n] == Walls.NONE &&
          (g[r - 1][c + n - 1] != Walls.NONE || g[r + 1][c + n - 1] != Walls.NONE)
        ) {
          row[2] -= 0.5
        }
        fences.value.push(row)
      }
      if (g[r][c] == Walls.FENCE && g[r - 1][c] != Walls.FENCE && g[r + 1][c] == Walls.FENCE) {
        let n = 0
        while (g[r + n][c] == Walls.FENCE) {
          n++
        }
        const col = [c + 0.5, r, c + 0.5, r + n]
        if (g[r - 1][c] == Walls.NONE && (g[r][c - 1] != Walls.NONE || g[r][c + 1] != Walls.NONE)) {
          col[1] += 0.5
        }
        if (
          g[r + n][c] == Walls.NONE &&
          (g[r + n - 1][c - 1] != Walls.NONE || g[r + n - 1][c + 1] != Walls.NONE)
        ) {
          col[3] -= 0.5
        }
        fences.value.push(col)
      }
    }
  }
}
const adjustx = (line: number[], g: Walls[][]): number[] => {
  const vi = 0.5
  let x1 = line[0]
  const y1 = line[1]
  let x2 = line[2]
  const y2 = line[3]
  if (g[y1][x1 - 1] == Walls.NONE) {
    x1 += vi
  } else if (g[y1][x1 - 1] == Walls.BASIC) {
    x1 -= vi
  }
  if (g[y2][x2] == Walls.NONE) {
    x2 -= vi
  } else if (g[y2][x2] == Walls.BASIC) {
    x2 += vi
  }
  return [x1, y1 + 0.5, x2, y2 + 0.5]
}
const adjusty = (col: number[], g: Walls[][]): number[] => {
  const vi = 0.5
  const x1 = col[0]
  let y1 = col[1]
  const x2 = col[2]
  let y2 = col[3]
  if (g[y1 - 1][x1] == Walls.NONE) {
    y1 += vi
  } else if (g[y1 - 1][x1] == Walls.BASIC) {
    y1 -= vi
  }
  if (g[y2][x2] == Walls.NONE) {
    y2 -= vi
  } else if (g[y2][x2] == Walls.BASIC) {
    y2 += vi
  }
  return [x1 + 0.5, y1, x2 + 0.5, y2]
}
const generateWalls = (g: Array<Walls>[]) => {
  const h = g.length - 1
  const w = g[0].length - 1
  for (let r = 0; r <= h; r++) {
    let c
    for (c = 0; c <= w; c++) {
      if (
        g[r][c] == Walls.BASIC &&
        (g[r][c - 1] != Walls.BASIC ||
          (g[r - 1][c] != Walls.BASIC && g[r - 1][c - 1] == Walls.BASIC) ||
          (g[r + 1][c] != Walls.BASIC && g[r + 1][c - 1] == Walls.BASIC))
      ) {
        let n = 0
        while (
          g[r][c + n] == Walls.BASIC &&
          (g[r - 1][c + n] != Walls.BASIC || g[r + 1][c + n] != Walls.BASIC)
        ) {
          n++
        }
        if (n == 0) continue
        //if (n == 1 && g[r][c - 1] != Walls.BASIC && g[r][c + 1] != Walls.BASIC) continue
        const row = adjustx([c, r, c + n, r], g)

        lines.value.push(row)
        c += n
      }
    }
  }
  for (let c = 0; c <= w; c++) {
    let r
    for (r = 0; r <= h; r++) {
      if (
        g[r][c] == Walls.BASIC &&
        (g[r - 1][c] != Walls.BASIC ||
          (g[r][c - 1] != Walls.BASIC && g[r - 1][c - 1] == Walls.BASIC) ||
          (g[r][c + 1] != Walls.BASIC && g[r - 1][c + 1] == Walls.BASIC))
      ) {
        let n = 0
        while (
          g[r + n][c] == Walls.BASIC &&
          (g[r + n][c - 1] != Walls.BASIC || g[r + n][c + 1] != Walls.BASIC)
        ) {
          n++
        }
        if (n == 0) continue
        //if (n == 1 && g[r - 1][c] != Walls.BASIC && g[r + 1][c] != Walls.BASIC) continue

        const col = adjusty([c, r, c, r + n], g)
        cols.value.push(col)
        r += n
      }
    }
  }
}

const generateOutlines = (g: Array<Walls>[]) => {
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

const drawWalls = (lines: number[][], cols: number[][]) => {
  if (!ctx) return
  ctx.clearRect(0, 0, width.value, height.value)
  ctx.strokeStyle = '#000000'
  //datasOut.walls = [];
  lines.forEach((a: Array<number>) => {
    if (!ctx) return
    //const w = JSON.parse(JSON.stringify(wall));
    //w.c = [(a[0]-1) * 50, (a[1]-1)* 50,(a[2]-1) * 50, (a[3]-1) * 50];
    //datasOut.walls.push(w);

    ctx.beginPath()
    ctx.moveTo(a[0] * size, a[1] * size)
    ctx.lineTo(a[2] * size, a[3] * size)
    ctx.stroke()
    ctx.closePath()
  })
  cols.forEach((a: Array<number>) => {
    if (!ctx) return
    //const w = JSON.parse(JSON.stringify(wall));
    //w.c = [(a[0]-1) * 50, (a[1]-1)* 50,(a[2]-1) * 50, (a[3]-1) * 50];
    //datasOut.walls.push(w);
    ctx.beginPath()
    ctx.moveTo(a[0] * size, a[1] * size)
    ctx.lineTo(a[2] * size, a[3] * size)
    ctx.stroke()
    ctx.closePath()
  })
  fences.value.forEach((a: Array<number>) => {
    if (!ctx) return
    //const w = JSON.parse(JSON.stringify(wall));
    //w.c = [(a[0]-1) * 50, (a[1]-1)* 50,(a[2]-1) * 50, (a[3]-1) * 50];
    //datasOut.walls.push(w);
    ctx.strokeStyle = '#333333'
    ctx.beginPath()
    ctx.moveTo(a[0] * size, a[1] * size)
    ctx.lineTo(a[2] * size, a[3] * size)
    ctx.stroke()
    ctx.closePath()
  })
  windows.value.forEach((a: Array<number>) => {
    if (!ctx) return
    //const w = JSON.parse(JSON.stringify(wall));
    //w.c = [(a[0]-1) * 50, (a[1]-1)* 50,(a[2]-1) * 50, (a[3]-1) * 50];
    //datasOut.walls.push(w);
    ctx.strokeStyle = '#8888DD'
    ctx.beginPath()
    ctx.moveTo(a[0] * size, a[1] * size)
    ctx.lineTo(a[2] * size, a[3] * size)
    ctx.stroke()
    ctx.closePath()
  })
  doors.value.forEach((a: Array<number>) => {
    if (!ctx) return
    //const w = JSON.parse(JSON.stringify(wall));
    //w.c = [(a[0]-1) * 50, (a[1]-1)* 50,(a[2]-1) * 50, (a[3]-1) * 50];
    //datasOut.walls.push(w);
    ctx.strokeStyle = '#FF8899'
    ctx.beginPath()
    ctx.moveTo(a[0] * size, a[1] * size)
    ctx.lineTo(a[2] * size, a[3] * size)
    ctx.stroke()
    ctx.closePath()
  })
}

watch(
  () => datas,
  () => {
    setTimeout(() => {
      of.value = 0.0
    }, 150)
  },
)
/*
  datasOut.width = datas.w * 50;
  datasOut.height = datas.h * 50;
  datasOut.padding = 0;
  outp.innerHTML = JSON.stringify(datasOut);
  */
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
    <input
      v-if="grid[0]"
      ref="slider"
      type="range"
      min="0.0"
      max="0.5"
      step="0.02"
      v-model="of"
    /><span v-if="grid[0]">{{ of }}</span>
  </div>
</template>

<style>
canvas {
  background-color: #eeeeee;
}
.col {
  margin: 1rem;
  border: 1px solid #dddddd;
  padding: 2rem;
  display: flex;
  flex-direction: column;
}
</style>
