<script setup lang="ts">
import { RouterView } from 'vue-router'

</script>

<template>
  <header>
    <h1>Rpg Map Editor 2 to Foundry VTT</h1>
  </header>
  <RouterView />
  <footer>
    <span><a href="https://mastodon.social/@Turboconnard">Turboconnard</a></span><span> / </span>
    <span><a href="https://github.com">github.com</a></span>
  </footer>
</template>

<style>
header {
  text-align: center;
}
footer {
  font-size: small;
  text-align: center;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 16px;
}
</style>
