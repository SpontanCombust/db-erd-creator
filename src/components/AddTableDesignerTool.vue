<script setup lang="ts">

import type DesignerToolExports from './DesignerToolExports';
import DbTable from '../model/DbTable';
import { useDbTableStore } from '../stores/DbTableStore';
import { useDesignerStateStore } from '../stores/DesignerStateStore';


const { toggleTableCreation } = useDesignerStateStore();
const { addTable } = useDbTableStore();


defineExpose({
  designerClick(ev: MouseEvent) {
    const tab = new DbTable({ posX: ev.offsetX, posY: ev.offsetY });
    addTable(tab);
    toggleTableCreation(false);
  }
} as DesignerToolExports);

</script>


<template>

</template>


<style lang="css">

</style>