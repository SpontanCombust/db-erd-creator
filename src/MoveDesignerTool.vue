<script setup lang="ts">

import { useDesignerState } from './composables/useDesignerState';
import type DesignerToolExports from './DesignerToolExports';
import type DbTable from './model/DbTable';


const designerState = useDesignerState();


let draggedTable: DbTable | null = null;
let draggingOffsetPx = 0;
let draggingOffsetPy = 0;

function onDragStart(ev: MouseEvent, table: DbTable) {
  draggedTable = table;
  draggingOffsetPx = ev.offsetX;
  draggingOffsetPy = ev.offsetY;
  
  document.addEventListener("mouseup", onDragEnd);
  document.addEventListener("mousemove", onDragMove);
}

function onDragEnd() {
  draggedTable = null;
}

function onDragMove(ev: MouseEvent) {
  if (draggedTable) {
    // mouse can move outside of the table element during dragging, so using `offsetX/Y` is not ideal here
    // draggedTable.designerPosition.x = ev.clientX - designerState.clientX - draggingOffsetPx;
    // draggedTable.designerPosition.y = ev.clientY - designerState.clientY - draggingOffsetPy;
  }
}


defineExpose({
  tableMouseDown(ev: MouseEvent, table: DbTable) {
    if ((ev.target as Element).classList.contains("table-header")) {
      onDragStart(ev, table);
    }
  }
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