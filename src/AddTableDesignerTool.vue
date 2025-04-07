<script setup lang="ts">

import { useDesignerState } from './composables/useDesignerState';
import type DesignerToolExports from './DesignerToolExports';
import DbTable from './model/DbTable';
import DesignerToolMode from './model/DesignerToolMode';


const designerState = useDesignerState();


defineExpose({
  designerClick(ev: MouseEvent) {
    const tab = new DbTable(null, { x: ev.offsetX, y: ev.offsetY });
    designerState.tables.push(tab);
    designerState.toolMode = DesignerToolMode.Move;
  }
} as DesignerToolExports);

</script>


<template>

</template>


<style lang="css">

</style>