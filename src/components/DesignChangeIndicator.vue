<script setup lang="ts">
import { useDbTableColumnStore } from '@/stores/DbTableColumnStore';
import { useDbTableRelationStore } from '@/stores/DbTableRelationStore';
import { useDbTableStore } from '@/stores/DbTableStore';
import { useDesignerStateStore } from '@/stores/DesignerStateStore';


const model = defineModel<boolean>();

const tableStore = useDbTableStore();
const columnStore = useDbTableColumnStore();
const relationStore = useDbTableRelationStore();
const designerStateStore = useDesignerStateStore();

tableStore.$onAction(({ name }) => {
  switch (name) {
    case 'addTable':
    case 'updateTable':
    case 'removeTable':
    case 'clearTables':
      model.value = true;
  }
});

columnStore.$onAction(({ name }) => {
  switch (name) {
    case 'addColumn':
    case 'updateColumn':
    case 'removeColumn':
    case 'clearColumns':
      model.value = true;
  }
});

relationStore.$onAction(({ name }) => {
  switch (name) {
    case 'addRelation':
    case 'updateRelation':
    case 'removeColumnRelationByKey':
    case 'removeTableRelationByKey':
    case 'clearRelations':
      model.value = true;
  }
});

designerStateStore.$onAction(({ name }) => {
  switch(name) {
    case 'setSelectedTableInheritanceKind':
      model.value = true;
  }
});

</script>


<template>
  <div class="indicator-wrapper" :style="{ opacity: model ? 1 : 0 }">
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="red"/>
    </svg>
  </div>
</template>


<style lang="css" scoped>

.indicator-wrapper {
  position: absolute;

  min-width: 10px;
  min-height: 10px;
  aspect-ratio: 1 / 1;
  top: 0;
  right: 0;
  z-index: 10;

  overflow: hidden;
}

.indicator-wrapper svg {
  display: block;
}

</style>