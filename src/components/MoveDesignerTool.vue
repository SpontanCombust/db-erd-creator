<script setup lang="ts">

import type DesignerToolExports from './DesignerToolExports';


defineExpose({
  
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