<script setup lang="ts">

import DbTableColumn from '@/model/DbTableColumn';
import { Handle, Position } from '@vue-flow/core';
import { computed, reactive, ref, useTemplateRef, watch } from 'vue';

import { useDbTableColumnStore } from '../stores/DbTableColumnStore';
import { Button, Checkbox, InputText, Popover } from 'primevue';


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


const keyType = computed(() => {
  if (model.isPrimaryKey) {
    return "PK";
  }
  else if (model.isForeignKey) {
    return "FK";
  }
  else {
    return undefined;
  }
});

function switchKeyType() {
  if (model.isPrimaryKey) {
    model.isPrimaryKey = false;
    model.isForeignKey = true;
  }
  else if (model.isForeignKey) {
    model.isPrimaryKey = false;
    model.isForeignKey = false;
  }
  else {
    model.isPrimaryKey = true;
    model.isForeignKey = false;
  }
}


const attributesPopoverRef = useTemplateRef('attrPopover');;

function toggleAttributesPopover(ev: Event) {
  attributesPopoverRef.value?.toggle(ev);
}

</script>


<template>
  
<li class="table-column nodrag">
  <Handle :id="model.id" :style="{ opacity: (model.isPrimaryKey || model.isForeignKey) ? 1 : 0 }" type="target" :position="Position.Left"/>
  <div class="table-column-key" @click="switchKeyType">
    {{ keyType }}
  </div>
  <span>
    <InputText type="text" v-model="model.name" placeholder="Column name"/>
  </span>
  <span>
    <InputText type="text" v-model="model.type" placeholder="Column type"/>
  </span>
  <Button type="button" icon="pi pi-ellipsis-v" @click="toggleAttributesPopover"/>
  <Popover ref="attrPopover">
    <div>
      <Checkbox v-model="model.isNullable" inputId="attrIsNullable" binary/>
      <label for="attrIsNullable">Nullable</label>
    </div>
    <div>
      <Checkbox v-model="model.isUnique" inputId="attrIsUnique" binary/>
      <label for="attrIsUnique">Unique</label>
    </div>
    <div>
      <InputText type="text" v-model="model.defaultValue" id="attrDefaultValue"/>
      <label for="attrDefaultValue">Default value</label>
    </div>
  </Popover>
  <Handle :id="model.id" :style="{ opacity: model.isPrimaryKey ? 1 : 0 }" type="source" :position="Position.Right"/>
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