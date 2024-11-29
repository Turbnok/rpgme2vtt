import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useDefaultStore = defineStore('default', () => {
  const output = ref("")
  return { output }
})
