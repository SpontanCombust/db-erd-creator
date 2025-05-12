<script setup lang="ts">

import { computed, reactive, ref, useTemplateRef, watch } from 'vue';
import { Handle, Position, type Connection } from '@vue-flow/core';
import { Button, Checkbox, InputText, Popover } from 'primevue';

import DbTableColumnView from './DbTableColumnView.vue';
import DbTable from '@/model/DbTable';
import DbTableColumn from '@/model/DbTableColumn';
import { useDbTableStore } from '../stores/DbTableStore';
import { useDbTableColumnStore } from '../stores/DbTableColumnStore';
import { useDbTableRelationStore } from '@/stores/DbTableRelationStore';
import DbTableRelationKind from '@/model/DbTableRelationKind';
import { useService } from '@/composables/useService';
import DesignManagerService from '@/services/DesignManagerService';


const props = defineProps<{
  tableId: string,
}>();

const emit = defineEmits<{
  mousedown: [MouseEvent],
  mouseup: [MouseEvent]
  click: [MouseEvent],
}>();


const { getTableByKey, updateTable, removeTable } = useDbTableStore();
const { getColumnsByTableId, addColumn } = useDbTableColumnStore();
const { getRelationsBySourceTableId } = useDbTableRelationStore();

const designManagerService = useService(DesignManagerService);


const model = reactive(function() {
  const tab = getTableByKey(props.tableId);
  if (tab) {
    return tab;
  } else {
    console.error(`Table with ID ${props.tableId} was not found`);
    return new DbTable({});
  }
}());

watch(model, (value) => updateTable(value));


const attributesPopoverRef = useTemplateRef('attrPopover');

function toggleAttributesPopover(ev: Event) {
  attributesPopoverRef.value?.toggle(ev);
}

function onDeleteTable() {
  removeTable(model.id);
  //FIXME columns and relations should also get removed 
}


const columnIds = computed(() => getColumnsByTableId(props.tableId).map(c => c.id));
const inheritsFromTable = computed(() => 
  getRelationsBySourceTableId(props.tableId)
  .filter(r => r.kind == DbTableRelationKind.InheritsFrom)
  .length > 0
);

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
    <Handle 
      :id="model.id" 
      type="source" 
      :position="Position.Top" 
      :connectableStart="!inheritsFromTable"
      :connectableEnd="false"
    />

    <div class="table-header">
      <InputText type="text" v-model="model.name" placeholder="Table name" size="large"/>
      <Button class="attributes-btn" type="button" icon="pi pi-ellipsis-v" @click="toggleAttributesPopover"/>
    </div>
    <ul class="table-content">
      <template v-for="columnId in columnIds">
        <DbTableColumnView :columnId="columnId"/>
      </template>
      <Button class="add-column-btn" @click="onAddColumnClick">+</Button>
    </ul>

    <Popover ref="attrPopover" class="attributes-popover">
      <div>
        <Checkbox v-model="model.isAbstract" inputId="attrIsAbstract" binary/>
        <label for="attrIsAbstract">Abstract</label>
      </div>
      <div>
        <Button @click="onDeleteTable" label="Delete" severity="danger"/>
      </div>
    </Popover>

    <Handle 
      :id="model.id" 
      type="target" 
      :position="Position.Bottom" 
      :connectableStart="false" 
      :connectableEnd="true"
    />
  </div>
  
</template>


<style lang="css">

.table-container {
  display: flex;
  flex-direction: column;
  
  min-width: 35em;
  width: 35em;
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
  flex-direction: row;
  justify-content: center;
  align-items: center;

  padding: 0.4em 0.0em 0.4em 2em;

  border-bottom: 0.1em solid black;
}

.table-header .p-inputtext {
  text-align: center;
  height: 2em;
  margin-right: 0.5em;
}

.table-header .attributes-btn {
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