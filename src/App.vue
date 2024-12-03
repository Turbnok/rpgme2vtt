<script setup lang="ts">
import { RouterView } from 'vue-router'

</script>

<template>
  <header>
    <h1>Rpg Map Editor 2 to Foundry VTT</h1>
  </header>
  <RouterView />
  <hr>
  <footer>
    <div class="help">

      <h3><a href="https://deepnight.net/tools/rpg-map">on RPG Map Editor 2</a></h3>
      <ul>
        <li>Create a map</li>
        <li>Save map json</li>
        <li>Export image with «Fantasy Grounds» settings (grid 50px)</li>
      </ul>
      <h3>on rpgme2vtt (this page)</h3>
      <ul>
        <li>Import RPGME2 map data</li>
        <li>Optionnaly import image</li>
        <li>Choose Outlined Mode or not</li>
        <li>Dowload foundryvtt scene</li>
      </ul>
      <h3>on foundryvtt</h3>
      <ul>
        <li>Create a new scene</li>
        <li>Import rpgme2vtt scene data</li>
        <li>Import image as background scene</li>
      </ul>
    </div>
    <div>
      <span><a href="https://mastodon.social/@Turboconnard">Turboconnard</a></span><span> / </span>
      <span><a href="https://github.com/Turbnok/rpgme2vtt">Sources</a></span>
    </div>
  </footer>
</template>
<style>
.help {

  max-width: 250px;
  text-align: left;
}

header {
  text-align: center;
}

footer {
  font-size: small;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 16px;
}
</style>
