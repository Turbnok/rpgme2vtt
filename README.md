# rpgme2vtt

A tool for foundryvtt.  
Generates walls, doors, windows from [RPG Map Editor 2](https://deepnight.net/tools/rpg-map/) maps.

on __RPG Map Editor 2__

1. Create a map
2. Save map json 
3. Export image with «Fantasy Grounds» settings (grid 50px)

on __rpgme2vtt__

4. Import map data on https://turbnok.github.io/rpgme2vtt/
5. Optionnaly import image in rpgme2tvv  
6. choose Outlined Mode or not  
7. Dowload foundryvtt scene  

on __foundryvtt__

8. Create a new scene
9. import rpgme2vtt scene data
10. import image as background scene



## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
