<script setup lang="ts">

import DbTableColumn from '@/model/DbTableColumn';
import { Handle, Position } from '@vue-flow/core';
import { computed, reactive, ref, useTemplateRef, watch } from 'vue';

import { useDbTableColumnStore } from '../stores/DbTableColumnStore';
import { Button, Checkbox, InputText, Popover } from 'primevue';


const props = defineProps<{
  columnId: string
}>();


const { getColumnByKey, updateColumn, removeColumn } = useDbTableColumnStore();


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

const mouseOverColumn = ref(false);

const keyColor = computed(() => {
  if (model.isPrimaryKey) {
    return "gold";
  } else if (model.isForeignKey) {
    return "silver";
  } else if (mouseOverColumn.value) {
    return "color-mix(in srgb, gold, transparent 70%)"
  } else {
    return "transparent";
  }
});


const attributesPopoverRef = useTemplateRef('attrPopover');;

function toggleAttributesPopover(ev: Event) {
  attributesPopoverRef.value?.toggle(ev);
}


function onDeleteColumn() {
  removeColumn(model.id);
}

</script>


<template>
  
<li class="table-column nodrag" @mouseenter="mouseOverColumn = true" @mouseleave="mouseOverColumn = false">
  <Handle :id="model.id" 
    type="target"
    :style="{ opacity: (model.isPrimaryKey || model.isForeignKey) ? 1 : 0 }" 
    :position="Position.Left"
    :connectableStart="false"
    :connectableEnd="true"
  />
  <div class="table-column-key" @click="switchKeyType">
    <i class="pi pi-key" :style="{ color: keyColor }"></i>
  </div>
  <span>
    <InputText type="text" v-model="model.name" placeholder="Column name" size="large"/>
  </span>
  <span>
    <InputText type="text" v-model="model.type" placeholder="Column type" size="large"/>
  </span>
  <Button class="attributes-btn" type="button" icon="pi pi-ellipsis-v" @click="toggleAttributesPopover"/>
  <Popover ref="attrPopover" class="attributes-popover">
    <div>
      <Checkbox v-model="model.isNullable" inputId="attrIsNullable" binary/>
      <label for="attrIsNullable">Nullable</label>
    </div>
    <div>
      <Checkbox v-model="model.isUnique" inputId="attrIsUnique" binary/>
      <label for="attrIsUnique">Unique</label>
    </div>
    <div>
      <InputText type="text" v-model="model.defaultValue" id="attrDefaultValue" placeholder="Default value" size="small"/>
    </div>
    <div>
      <Button @click="onDeleteColumn" label="Delete" severity="danger"/>
    </div>
  </Popover>
  <Handle :id="model.id" 
    type="source" 
    :style="{ opacity: model.isPrimaryKey ? 1 : 0 }" 
    :position="Position.Right"
    :connectableStart="true"
    :connectableEnd="false"
  />
</li>
  
</template>


<style lang="css" scoped>

.vue-flow__handle {
  transform: scale(150%)
}

.vue-flow__handle-left {
  color: white;
}

.table-column {
  display: flex;
  flex-direction: row;
  position: relative;
  align-items: center;

  padding: 0.1em 0.8em;
  gap: 0.2em;
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

  cursor: pointer;
}

.table-column > span:nth-of-type(2) > input {
  text-align: left;
}

.table-column > span:nth-of-type(3) > input {
  text-align: right;
}

.attributes-btn {
  height: 1em;
  width: 1.5em;
}

.attributes-popover .p-popover-content > div {
  margin: 0.5em 0;
}

.attributes-popover .p-popover-content label {
  margin-left: 0.5em;
}

.attributes-popover .p-popover-content .p-inputtext {
  height: 2em;
}

.attributes-popover .p-popover-content > div:last-of-type {
  margin-top: 1.5em;
}

</style>