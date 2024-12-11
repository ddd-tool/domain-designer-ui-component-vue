<script setup lang="ts"></script>

<template>
  <Suspense>
    <RouterView />
    <template #fallback>
      <h1>Loading...</h1>
    </template>
  </Suspense>
</template>
