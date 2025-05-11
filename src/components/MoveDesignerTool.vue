<script setup lang="ts">

import { useDbTableStore } from '@/stores/DbTableStore';
import type DesignerToolExports from './DesignerToolExports';


const { getTableByKey, updateTable } = useDbTableStore();

defineExpose({
  tableMove(x, y, tableId) {
    const tab = getTableByKey(tableId);
    if (tab) {
      tab.posX = x;
      tab.posY = y;

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