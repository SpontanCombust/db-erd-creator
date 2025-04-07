<script setup lang="ts">

import type DbTableColumn from '@/model/DbTableColumn';
import { Handle, Position } from '@vue-flow/core';

import { ref, watch } from 'vue';


const props = defineProps<{
  model: DbTableColumn
}>();


const columnName = ref(props.model.name);
const columnType = ref(props.model.type);
const keyType = ref<null | "PK" | "FK">(null);

watch(columnName, (value) => props.model.name = value );
watch(columnType, (value) => props.model.type = value );
watch(keyType, (value) => props.model.keyType = value );


function switchKeyType() {
  switch (keyType.value) {
    case null:
      keyType.value = "PK"; break;
    case "PK":
      keyType.value = "FK"; break;
    default:
      keyType.value = null;
  }
}

</script>


<template>
  
<li class="table-column nodrag">
  <Handle :id="props.model.id" :style="{ opacity: model.keyType == 'FK' ? 1 : 0 }" type="target" :position="Position.Left"/>
  <div class="table-column-key" @click="switchKeyType">
    {{ model.keyType }}
  </div>
  <span>
    <input type="text" v-model="columnName" placeholder="Column name"/>
  </span>
  <span>
    <input type="text" v-model="columnType" placeholder="Column type"/>
  </span>
  <Handle :id="props.model.id" :style="{ opacity: model.keyType == 'PK' ? 1 : 0 }" type="source" :position="Position.Right"/>
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