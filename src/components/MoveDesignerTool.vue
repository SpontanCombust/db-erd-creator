<script setup lang="ts">

import { useDbTableStore } from '@/stores/DbTableStore';
import type DesignerToolExports from './DesignerToolExports';


const { getTableByKey, updateTable } = useDbTableStore();

defineExpose({
  tableDragEnd(ev, tableId) {
    const tab = getTableByKey(tableId);
    if (tab) {
      tab.posX = ev.clientX;
      tab.posY = ev.clientY;

      updateTable(tab);
    }
  },
} as DesignerToolExports);

</script>


<template>

<div id="move-designer-tool"></div>

</template>


<style lang="css">

#designer:has(#move-designer-tool) .table-header {
  cursor: move;
}

</style>