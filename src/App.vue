<template>
  <RouterView />
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  setTimeout(() => {
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }, 100)
})
</script>
