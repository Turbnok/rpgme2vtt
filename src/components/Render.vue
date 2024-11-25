<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import { Walls } from '@/main'
import type { RPGme2 } from '@/views/HomeView.vue'

interface Props {
  grid: Array<Walls>[]
  datas: RPGme2
}
const { grid, datas } = defineProps<Props>()
const slider = useTemplateRef('slider')
const lines = ref<Array<number>[]>([])
const of = ref(0.4)
const size = 20
const cols = ref<Array<number>[]>([])
const windows = ref<Array<number>[]>([])
const doors = ref<Array<number>[]>([])
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
  lines.value = []
  cols.value = []
  windows.value = []
  doors.value = []
  generateWalls(grid, lines.value, cols.value)
  generateWindows(datas, grid)
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
const generateWindows = (datas: RPGme2, g) => {
  datas.objects.forEach((o) => {
    let point
    if (o.w > o.h || g[o.y + 1][o.x - 1 + 1] == Walls.BASIC) {
      point = [o.x + 1 - 1 * of.value, o.y + 1.5, o.x + o.w + 1 + 1 * of.value, o.y + o.h + 0.5]
    } else {
      point = [o.x + 1.5, o.y + 1 - 1 * of.value, o.x + o.w + 0.5, o.y + o.h + 1 + 1 * of.value]
    }
    if (o.t.id == 10) {
      windows.value.push(point)
    } else if (o.t.id == 2) {
      doors.value.push(point)
    }
  })
}

const generateWalls = (g: Array<Walls>[], lines: Array<number>[], cols: Array<number>[]) => {
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

const drawWalls = (lines, cols) => {
  if (!ctx) return

  ctx.clearRect(0, 0, width.value, height.value)
  ctx.strokeStyle = '#000000'
  //datasOut.walls = [];
  console.log(lines.length)
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
  /*
  datasOut.width = datas.w * 50;
  datasOut.height = datas.h * 50;
  datasOut.padding = 0;
  outp.innerHTML = JSON.stringify(datasOut);
  */
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
  <div>
    <canvas ref="can" :width="`${width}px`" :height="`${height}px`"></canvas>
    <input v-if="grid[0]" ref="slider" type="range" min="0.0" max="0.5" step="0.02" v-model="of" />
  </div>
</template>

<style></style>
