<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted, watch } from 'vue'
import Jiugongge from './components/Jiugongge.vue'
import type { menu } from './type/index'

const Blindbox = defineAsyncComponent(() => import('./components/Blindbox.vue'))
const Custom = defineAsyncComponent(() => import('./components/Custom.vue'))

const components = {
  Jiugongge,
  Blindbox,
  Custom
}

const componentName = ref<keyof typeof components>('Jiugongge')

const changeName = (name: keyof typeof components) => {
  componentName.value = name
}

const localData = ref<menu[]>([])

watch(()=>localData.value,() => {
  localStorage.setItem('data', JSON.stringify(localData.value))
})

onMounted(() => {
  if(localStorage.getItem('data')){
    localData.value = JSON.parse(localStorage.getItem('data') as string)
  }
})

type updateMenu = (data: any) => void
const updateMenu: updateMenu = (data: menu[]) => {
  console.log(data)
  localData.value = data
}
</script>

<template>
  <component :is="components[componentName]" @changeName="changeName" :localData="localData" @update="updateMenu"></component>
</template>

<style scoped>

</style>
