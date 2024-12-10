<script setup lang="ts">
import { Ui } from '#lib/index'
import { ref } from 'vue'
import defaultDesign from './design'

const design = ref(defaultDesign)
</script>

<template>
  <Ui :design="design" />
</template>
