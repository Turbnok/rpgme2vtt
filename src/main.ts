import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
export enum Walls {
  NONE,
  BASIC,
  WINDOW,
  FENCE,
  DOOR,
}
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
