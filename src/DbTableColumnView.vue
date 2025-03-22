<script setup lang="ts">

import type DbTableColumn from '@/model/DbTableColumn';

import { ref, watch } from 'vue';


const props = defineProps<{
  model: DbTableColumn
}>();


const columnName = ref(props.model.name);
const columnType = ref(props.model.type);

watch(columnName, (value) => props.model.name = value );
watch(columnType, (value) => props.model.type = value );

</script>


<template>
  
<li class="table-column">
  <span>
    <input type="text" v-model="columnName" placeholder="Column name"/>
  </span>
  <span>
    <input type="text" v-model="columnType" placeholder="Column type"/>
  </span>
</li>
  
</template>


<style lang="css">

.table-column input {
  width: 10em;
}

.table-column input {
  padding: 0 0.5em;
}

.table-column > span:nth-of-type(1) > input {
  text-align: left;
}

.table-column > span:nth-of-type(2) > input {
  text-align: right;
}

</style>