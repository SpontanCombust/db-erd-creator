<script setup lang="ts">
import { onMounted } from 'vue';
import { disconnectFromDb } from './api/tauri';
import { useDbConnectionStore } from './stores/DbConnectionStore';


const { releaseConnection } = useDbConnectionStore();

onMounted(async () => {
  disconnectFromDb();
  releaseConnection();

  setTimeout(() => {
    window.location.hash = '#/';
  }, 500);
});

</script>

<template>
  <h1>Redirecting to home page...</h1>
</template>