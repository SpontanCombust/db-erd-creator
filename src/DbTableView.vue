<script setup lang="ts">

import { computed, reactive, ref, watch } from 'vue';

import DbTableColumnView from './DbTableColumnView.vue';
import DbTable from '@/model/DbTable';
import { useDesignerState } from '@/composables/useDesignerState';
import DesignerToolMode from '@/model/DesignerToolMode';
import DbTableColumn from '@/model/DbTableColumn';
import { useDbTableStore } from './stores/DbTableStore';
import { useDbTableColumnStore } from './stores/DbTableColumnStore';


const props = defineProps<{
  tableId: string,
}>();

const emit = defineEmits<{
  mousedown: [MouseEvent],
  mouseup: [MouseEvent]
  click: [MouseEvent],
}>();


const designerState = useDesignerState();
const { getTableByKey: getTableById, updateTable } = useDbTableStore();
const { getColumnsByTableId, addColumn } = useDbTableColumnStore();


const model = reactive(function() {
  const tab = getTableById(props.tableId);
  if (tab) {
    return tab;
  } else {
    console.error(`Table with ID ${props.tableId} was not found`);
    return new DbTable({});
  }
}());

watch(model, (value) => updateTable(value));


const columnIds = computed(() => getColumnsByTableId(props.tableId).map(c => c.id));


const relationCreationActive = computed(() => {
  return [
    DesignerToolMode.AddRelation11, 
    DesignerToolMode.AddRelation1N, 
    DesignerToolMode.AddRelationNN, 
    DesignerToolMode.AddRelationInheritance
  ].includes(designerState.toolMode);
});


</script>


<template>
  
  <div 
    class="table-container" 
    :class="{ 
      'table-outline': relationCreationActive
    }"
    :style="{ left: `${model.posX}px`, top: `${model.posY}px` }"
    @mousedown="(ev) => $emit('mousedown', ev)"
    @mouseup="(ev) => $emit('mouseup', ev)"
    @click="(ev) => $emit('click', ev)"
  >
    <div class="table-header">
      <input type="text" v-model="model.name" placeholder="Table name"/>
    </div>
    <ul class="table-content">
      <template v-for="columnId in columnIds">
        <DbTableColumnView :columnId="columnId"/>
      </template>
      <button @click="addColumn(new DbTableColumn({ tableId: model.id }))">+</button>
    </ul>
  </div>
  
</template>


<style lang="css">

.table-container {
  display: flex;
  flex-direction: column;
  
  min-width: 20em;
  min-height: 20em;
  
  background-color: white;
  border: 0.1em solid black;
}

.table-outline:hover {
  outline: 0.5em solid white;
  outline-offset: 0.2em;
}

.table-header {
  display: flex;
  flex-direction: column;
  align-items: center;

  border-bottom: 0.1em solid black;
}

.table-header input {
  text-align: center;
}

.table-content {
  list-style: none;
}

.table-content > button {
  width: 100%;
}

</style>