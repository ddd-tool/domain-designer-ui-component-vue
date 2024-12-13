<script setup lang="ts">
import { Ui } from '#lib/index'
import { ref } from 'vue'

const designs = ref({
  'design-zh': (await import('./design-zh')).default,
  'design-en': (await import('./design-en')).default,
})
// designs.value = {
//   user: (await import('F:/idea_projects/oneboot/.sdk/uml/demo/user')).default,
// }
</script>

<template>
  <Ui :designs="designs" />
</template>
