<script setup lang="ts">
import { onMounted } from 'vue';
import { isConnectedToDb } from './api/tauri';


onMounted(async () => {
  let connected = false;
  try {
    connected = await isConnectedToDb();
  } catch (err: any) {
    console.warn("Connection test error: " + err);
  }

  if (connected) {
    window.location.hash = '#/designer';
  } else {
    window.location.hash = '#/connect';
  }
});

</script>


<template>

</template>