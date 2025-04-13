<script setup lang="ts">

import DbTableColumn from '@/model/DbTableColumn';
import { Handle, Position } from '@vue-flow/core';

import { reactive, watch } from 'vue';
import { useDbTableColumnStore } from './stores/DbTableColumnStore';


const props = defineProps<{
  columnId: string
}>();


const { getColumnByKey, updateColumn } = useDbTableColumnStore();


const model = reactive(function() {
  const col = getColumnByKey(props.columnId);
  if (col) {
    return col;
  } else {
    console.error(`Table column with ID ${props.columnId} was not found`);
    return new DbTableColumn({tableId: ""});
  }
}());

watch(model, (value) => updateColumn(value));


function switchKeyType() {
  switch (model.keyType) {
    case null:
      model.keyType = "PK"; break;
    case "PK":
      model.keyType = "FK"; break;
    default:
      model.keyType = null;
  }
}

</script>


<template>
  
<li class="table-column nodrag">
  <Handle :id="model.id" :style="{ opacity: model.keyType == 'FK' ? 1 : 0 }" type="target" :position="Position.Left"/>
  <div class="table-column-key" @click="switchKeyType">
    {{ model.keyType }}
  </div>
  <span>
    <input type="text" v-model="model.name" placeholder="Column name"/>
  </span>
  <span>
    <input type="text" v-model="model.type" placeholder="Column type"/>
  </span>
  <Handle :id="model.id" :style="{ opacity: model.keyType == 'PK' ? 1 : 0 }" type="source" :position="Position.Right"/>
</li>
  
</template>


<style lang="css">

.table-column {
  position: relative;
}

.table-column input {
  width: 10em;
}

.table-column input {
  padding: 0 0.5em;
}

.table-column > .table-column-key {
  display: inline-block;
  min-width: 2em;
  min-height: 1em;
  margin: 0 auto;
  text-align: center;
}

.table-column > span:nth-of-type(2) > input {
  text-align: left;
}

.table-column > span:nth-of-type(3) > input {
  text-align: right;
}

</style>