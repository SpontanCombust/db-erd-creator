<script setup lang="ts">

import { ref } from 'vue';
import { connectToSqliteDb } from './api/tauri';


//TODO let user choose the database based on driver list and suggest installing more drivers
const dbPath = ref('');
const connectionError = ref('');

async function tryConnecting() {
  try {
    await connectToSqliteDb('SQLite3 ODBC Driver', dbPath.value);
    window.location.hash = '#/designer';
  } catch (err: any) {
    connectionError.value = err;
  }
}

</script>


<template>
  <label>
    SQLite database path
    <input type="text" v-model="dbPath"/>
  </label>
  <p :style="{ color: 'red' }">{{ connectionError }}</p>
  <button @click="tryConnecting">Connect</button>
</template>