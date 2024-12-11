<script setup lang="ts">
import { Ui } from '#lib/index'
import { ref } from 'vue'

const design = ref()
design.value = (await import('./design')).default
</script>

<template>
  <Ui :design="design" />
</template>
