<script setup lang="ts">

import { useDesignerState } from './composables/useDesignerState';
import type DesignerToolExports from './DesignerToolExports';
import DbTable from './model/DbTable';
import DesignerToolMode from './model/DesignerToolMode';
import { useDbTableStore } from './stores/DbTableStore';


const designerState = useDesignerState();
const { addTable } = useDbTableStore();


defineExpose({
  designerClick(ev: MouseEvent) {
    const tab = new DbTable({ posX: ev.offsetX, posY: ev.offsetY });
    addTable(tab);
    designerState.toolMode = DesignerToolMode.Move;
  }
} as DesignerToolExports);

</script>


<template>

</template>


<style lang="css">

</style>