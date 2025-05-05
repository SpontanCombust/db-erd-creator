<script setup lang="ts">

import { computed, reactive, ref, watch } from 'vue';

import DbTableColumnView from './DbTableColumnView.vue';
import DbTable from '@/model/DbTable';
import DbTableColumn from '@/model/DbTableColumn';
import { useDbTableStore } from '../stores/DbTableStore';
import { useDbTableColumnStore } from '../stores/DbTableColumnStore';
import { Handle, Position } from '@vue-flow/core';
import { Button, InputText } from 'primevue';


const props = defineProps<{
  tableId: string,
}>();

const emit = defineEmits<{
  mousedown: [MouseEvent],
  mouseup: [MouseEvent]
  click: [MouseEvent],
}>();


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


function onAddColumnClick() {
  const col = new DbTableColumn({ tableId: model.id });
  addColumn(col);
}
 
</script>


<template>
  
  <div 
    class="table-container" 
    :style="{ left: `${model.posX}px`, top: `${model.posY}px` }"
    @mousedown="(ev) => $emit('mousedown', ev)"
    @mouseup="(ev) => $emit('mouseup', ev)"
    @click="(ev) => $emit('click', ev)"
  >
    <Handle :id="model.id" type="source" :position="Position.Top"/>
    <div class="table-header">
      <InputText type="text" v-model="model.name" placeholder="Table name" size="large"/>
    </div>
    <ul class="table-content">
      <template v-for="columnId in columnIds">
        <DbTableColumnView :columnId="columnId"/>
      </template>
      <Button class="add-column-btn" @click="onAddColumnClick">+</Button>
    </ul>
    <Handle :id="model.id" type="target" :position="Position.Bottom"/>
  </div>
  
</template>


<style lang="css">

.table-container {
  display: flex;
  flex-direction: column;
  
  min-width: 20em;
  min-height: 20em;
  padding: 0.4em;
  
  background-color: white;
  border: 0.2em solid var(--p-primary-color);
  border-radius: 1em;
}

.table-outline:hover {
  outline: 0.5em solid white;
  outline-offset: 0.2em;
}

.table-header {
  display: flex;
  flex-direction: column;
  align-items: center;

  padding-bottom: 0.4em;
  margin-bottom: 0.4em;

  border-bottom: 0.1em solid black;
}

.table-header .p-inputtext {
  text-align: center;
  height: 2em;
}

.table-content {
  list-style: none;
}

.table-content > button {
  width: 100%;
}

.add-column-btn {
  height: 1.5em;
  margin-top: 0.5em;
}

</style>