<script setup lang="ts">

import { computed, ref, watch } from 'vue';

import DbTableColumnView from './DbTableColumnView.vue';
import type DbTable from '@/model/DbTable';
import { useDesignerState } from '@/composables/useDesignerState';
import DesignerToolMode from '@/model/DesignerToolMode';
import DbTableColumn from '@/model/DbTableColumn';


const props = defineProps<{
  model: DbTable,
}>();

const emit = defineEmits<{
  mousedown: [MouseEvent],
  mouseup: [MouseEvent]
  click: [MouseEvent],
}>();


const designerState = useDesignerState();


const tableName = ref(props.model.name);

watch(tableName, (value) => props.model.name = value);


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
    :style="{ left: `${props.model.designerPosition.x}px`, top: `${props.model.designerPosition.y}px` }"
    @mousedown="(ev) => $emit('mousedown', ev)"
    @mouseup="(ev) => $emit('mouseup', ev)"
    @click="(ev) => $emit('click', ev)"
  >
    <div class="table-header">
      <input type="text" v-model="tableName" placeholder="Table name"/>
    </div>
    <ul class="table-content">
      <template v-for="column in props.model.columns">
        <DbTableColumnView :model="column"/>
      </template>
      <button @click="props.model.columns.push(new DbTableColumn(null))">+</button>
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