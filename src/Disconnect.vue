<script setup lang="ts">
import { onMounted } from 'vue';
import { disconnectFromDb } from './api/tauri';
import { useDbConnectionStore } from './stores/DbConnectionStore';
import { useDbTableStore } from './stores/DbTableStore';
import { useDbTableColumnStore } from './stores/DbTableColumnStore';
import { useDbTableRelationStore } from './stores/DbTableRelationStore';


const { releaseConnection } = useDbConnectionStore();
const { clearTables } = useDbTableStore();
const { clearColumns } = useDbTableColumnStore();
const { clearRelations } = useDbTableRelationStore();

onMounted(async () => {
  disconnectFromDb();
  releaseConnection();
  clearTables();
  clearColumns();
  clearRelations();

  setTimeout(() => {
    window.location.hash = '#/';
  }, 500);
});

</script>

<template>
  <h1>Redirecting to home page...</h1>
</template>