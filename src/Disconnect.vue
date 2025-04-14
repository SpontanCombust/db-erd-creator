<script setup lang="ts">
import { onMounted } from 'vue';
import { disconnectFromDb } from './api/tauri';


onMounted(async () => {
  disconnectFromDb();

  setTimeout(() => {
    window.location.hash = '#/';
  }, 1000);
});

</script>

<template>
  <h1>Redirecting to home page...</h1>
</template>