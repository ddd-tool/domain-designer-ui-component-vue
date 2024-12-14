<script setup lang="ts">
import { Ui } from '#lib/index'
import { ref } from 'vue'
import data from './index'

const designs = ref(data)
// designs.value = {
//   user: (await import('F:/idea_projects/oneboot/.sdk/uml/demo/user')).default,
// }
</script>

<template>
  <Ui :designs="designs" />
</template>
