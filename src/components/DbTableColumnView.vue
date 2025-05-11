<script setup lang="ts">

import DbTableColumn from '@/model/DbTableColumn';
import { Handle, Position, type Connection } from '@vue-flow/core';
import { computed, onMounted, reactive, ref, useTemplateRef, watch } from 'vue';
import { Button, Checkbox, IftaLabel, InputText, Popover, Select } from 'primevue';

import { useDbTableColumnStore } from '../stores/DbTableColumnStore';
import { useService } from '@/composables/useService';
import DbDataTypeTemplateProviderService from '@/services/DbDataTypeTemplateProviderService';
import DbDataType from '@/model/DbDataType';


const props = defineProps<{
  columnId: string
}>();


const dataTypeTemplateProviderService = useService(DbDataTypeTemplateProviderService);

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


function isValidConnectionSource(conn: Connection) : boolean {
  return model.isPrimaryKey;
}

function isValidConnectionTarget(conn: Connection) : boolean {
  return model.isPrimaryKey || model.isForeignKey;
}



const availableDataTypes = Array.from(dataTypeTemplateProviderService.availableDataTypeTemplates()).map(dt => ({
  value: dt,
  label: dt.fullName
}));

const chosenDataType = ref<DbDataType | undefined>(undefined);
const chosenDataTypeArgs = ref<string[]>([]);

onMounted(() => {
  const parsedType = DbDataType.parse(model.type);
  chosenDataTypeArgs.value = parsedType.params ?? [];

  const template = availableDataTypes
    .map(({value}) => value)
    .find(value => value.fullName == parsedType.fullName);
  
  if (template != undefined) {
    chosenDataType.value = template;
  }
});

watch(chosenDataType, typVal => {
  if (typVal) {
    model.type = typVal.replaceParams(chosenDataTypeArgs.value).toString();
  }
});
watch(chosenDataTypeArgs, typArgsVal => {
  if (chosenDataType.value) {
    model.type = chosenDataType.value.replaceParams(typArgsVal).toString();
  }
}, { deep: true })



const attributesPopoverRef = useTemplateRef('attrPopover');

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
    :isValidConnection="isValidConnectionTarget"
  />

  <div class="table-column-key" @click="switchKeyType">
    <i class="pi pi-key" :style="{ color: keyColor }"></i>
  </div>
  <InputText type="text" v-model="model.name" 
    placeholder="Column name" 
    size="large"
    class="table-column-name"
  />
  <span class="table-column-type">
    <Select v-model="chosenDataType" 
      :options="availableDataTypes"
      option-label="label" option-value="value" 
      placeholder="Column type" 
      filter
      class="table-column-type-name"
    />
    <template v-if="chosenDataType?.params" v-for="(param, i) of chosenDataType.params">
      <InputText type="text" v-model="chosenDataTypeArgs[i]" 
        class="table-column-type-args" 
        variant="outlined"
        :placeholder="param"
      />
    </template>
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
    :isValidConnection="isValidConnectionSource"
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
  display: grid;
  grid-template-columns: 5fr 35fr 45fr 5fr;

  position: relative;
  align-items: center;
  width: 100%;

  padding: 0.1em 0.8em;
  gap: 0.4em;
}

.table-column input {
  width: 10em;
}

.table-column input {
  padding: 0 0.5em;
}

.table-column .table-column-key {
  display: inline-block;
  min-width: 2em;
  min-height: 1em;
  margin: 0 auto;
  text-align: center;

  cursor: pointer;
}

.table-column .table-column-name {
  height: 2.5em;
  width: 100%;
}

.table-column .table-column-type {
  overflow: hidden;

  display: flex;
  flex-direction: row;
}

.table-column .table-column-type-name {
  flex: 90;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
}

.table-column .table-column-type-args {
  flex: 10;
  min-width: 0;
  min-height: 0; 
}

.table-column .attributes-btn {
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