<script setup lang="ts">

import { computed, onUpdated, ref, useTemplateRef, watch } from 'vue';
import { ConnectionMode, VueFlow, type Connection, type Edge, type EdgeChange, type Node, type NodeChange, type NodeDragEvent, type NodeMouseEvent } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { storeToRefs } from 'pinia';
import { ButtonGroup, FileUpload, FloatLabel, Select, ToggleButton, type FileUploadSelectEvent, type FileUploadUploadEvent } from 'primevue';
import { Button } from 'primevue'
import * as tauriDialog from '@tauri-apps/plugin-dialog';
import * as tauriFs from '@tauri-apps/plugin-fs';

import DbTable from './model/DbTable';
import DbTableView from './components/DbTableView.vue';
import AddTableDesignerTool from './components/AddTableDesignerTool.vue';
import DbTableRelation from './model/DbTableRelation';
import DbTableRelationKind from './model/DbTableRelationKind';
import SqlEmitterService from './services/SqlEmitterService';
import DbTableRelationView from './components/DbTableRelationView.vue';
import { useDbTableStore } from './stores/DbTableStore';
import { useDbTableRelationStore } from './stores/DbTableRelationStore';
import { useDbTableColumnStore } from './stores/DbTableColumnStore';
import { executeDbQuery } from './api/tauri';
import { useDbConnectionStore } from './stores/DbConnectionStore';
import { useDesignerStateStore } from './stores/DesignerStateStore';
import MoveDesignerTool from './components/MoveDesignerTool.vue';
import { useService } from './composables/useService';
import JsonPersistenceService from './services/JsonPersistenceService';
import DbTableInheritanceKind from './model/DbTableInheritanceKind';


const sqlEmitterService = useService(SqlEmitterService);
const jsonPersistenceService = useService(JsonPersistenceService);

const { dbName } = useDbConnectionStore();


const designerStateStore = useDesignerStateStore();

const { 
  tableMovingActive,
  tableCreationActive,
  selectedTableRelationKind,
  selectedTableInheritanceKind
} = storeToRefs(designerStateStore);

const {
  setDesignerClientPosition,
  toggleTableMoving,
  toggleTableCreation,
  setSelectedTableRelationKind,
  setSelectedTableInheritanceKind
} = designerStateStore;


async function loadDesign(ev: FileUploadSelectEvent) {
  if (ev.files) {
    const file = ev.files instanceof File ? ev.files : ev.files.at(0);
    if (!file) {
      return;
    }
    
    const json = await file.text();
    console.log(json);

    try {
      jsonPersistenceService.loadDesignFromJson(json);
    } catch (err: any) {
      console.error(err);
    }
  }
}

async function saveDesign() {
  const filePath = await tauriDialog.save({
    title: 'Save design',
    defaultPath: `${dbName}.json`,
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  const json = jsonPersistenceService.saveCurrentDesignToJson();

  if (filePath) {
    await tauriFs.writeTextFile(filePath, json);
  }
}



const designerRef = useTemplateRef('designer');

onUpdated(() => {
  const bcr = designerRef.value?.getBoundingClientRect() ?? new DOMRect();
  setDesignerClientPosition(bcr.x, bcr.y);
});


const designerToolboxTableMovingActive = computed({
  get() {
    return tableMovingActive.value;
  },
  set(value) {
    toggleTableMoving(value);
  }
});
const designerToolboxTableCreationActive = computed({
  get() {
    return tableCreationActive.value;
  },
  set(value) {
    toggleTableCreation(value);
  }
});
const designerToolboxOneToOneRelActive = computed({
  get() {
    return selectedTableRelationKind.value == DbTableRelationKind.OneToOne;
  },
  set(value) {
    if (value) {
      setSelectedTableRelationKind(DbTableRelationKind.OneToOne);
    }
  }
});
const designerToolboxOneToManyRelActive = computed({
  get() {
    return selectedTableRelationKind.value == DbTableRelationKind.OneToMany;
  },
  set(value) {
    if (value) {
      setSelectedTableRelationKind(DbTableRelationKind.OneToMany);
    }
  }
});
const designerToolboxManyToManyRelActive = computed({
  get() {
    return selectedTableRelationKind.value == DbTableRelationKind.ManyToMany;
  },
  set(value) {
    if (value) {
      setSelectedTableRelationKind(DbTableRelationKind.ManyToMany);
    }
  }
});
const designerToolboxInheritanceRelActive = computed({
  get() {
    return selectedTableRelationKind.value == DbTableRelationKind.InheritsFrom;
  },
  set(value) {
    if (value) {
      setSelectedTableRelationKind(DbTableRelationKind.InheritsFrom);
    }
  }
});
const designerToolboxAvailableTableInheritanceKinds = [
  {
    label: "Single Table Inheritance",
    value: DbTableInheritanceKind.SingleTable
  },
  {
    label: "Class Table Inheritance",
    value: DbTableInheritanceKind.ClassTable
  },
  {
    label: "Concrete Table Inheritance",
    value: DbTableInheritanceKind.ConcreteTable
  }
];
const designerToolboxTableInheritanceKind = ref(function() {
  return designerToolboxAvailableTableInheritanceKinds
    .find(k => k.value == selectedTableInheritanceKind.value)
    ?? designerToolboxAvailableTableInheritanceKinds[0];
}())
watch(designerToolboxTableInheritanceKind, value => {
  setSelectedTableInheritanceKind(value.value);
});


const designerTools = computed(() => ([
  {
    id: 'Move',
    cmp: MoveDesignerTool,
    enabled: tableMovingActive.value
  },
  {
    id: 'AddTable',
    cmp: AddTableDesignerTool,
    enabled: tableCreationActive.value
  },
]));

const enabledDesignerTools = computed(() => {
  return designerTools.value
    .filter(c => c.enabled)
});


const designerToolRefs = useTemplateRef('designerToolComponents');

function onDesignerClick(ev: MouseEvent) {
  designerToolRefs.value?.forEach(t => t?.designerClick?.(ev));
}

function onTableMouseDown(ev: MouseEvent, tableId: string) {
  designerToolRefs.value?.forEach(t => t?.tableMouseDown?.(ev, tableId));
}

function onTableMouseUp(ev: MouseEvent, tableId: string) {
  designerToolRefs.value?.forEach(t => t?.tableMouseUp?.(ev, tableId));
}

function onTableClick(ev: NodeMouseEvent) {
  const mouseEv = mouseEventFromNodeMouseEvent(ev);
  if (mouseEv) {
    const tabId = ev.node.data as string;
    designerToolRefs.value?.forEach(t => t?.tableClick?.(mouseEv, tabId));
  }
}

function onTableDragEnd(ev: NodeDragEvent) {
  const tabId = ev.node.data as string;
  designerToolRefs.value?.forEach(t => t?.tableDragEnd?.(ev, tabId));
}

function mouseEventFromNodeMouseEvent(ev: NodeMouseEvent) : MouseEvent | null {
  if (!('touches' in ev.event)) {
    return ev.event as MouseEvent;
  } else {
    return null;
  }
}


const { tables } = storeToRefs(useDbTableStore());
const { removeTable } = useDbTableStore();
const { getColumnByKey: getColumnById } = useDbTableColumnStore();
const { relations } = storeToRefs(useDbTableRelationStore());
const { addRelation, removeRelation } = useDbTableRelationStore();

const nodes = computed<Node[]>(() => tables.value.map(t => ({
  id: t.id,
  position: { x: t.posX, y: t.posY },
  type: 'table',
  data: t.id,
} as Node)));

const edges = computed<Edge[]>(() => relations.value.map(r => ({
  id: r.sourceColumnId + '--' + r.targetColumnId,
  source: r.sourceTableId,
  sourceHandle: r.sourceColumnId,
  target: r.targetTableId,
  targetHandle: r.targetColumnId,
  type: 'relation',
  data: r
} as Edge)));


function onConnectTables(conn: Connection) {
  if (!conn.sourceHandle || !conn.targetHandle // make sure handles are valid
    || conn.source == conn.target // make sure you cannot connect table to itself
  ) {
    return;
  }

  const relationKind = selectedTableRelationKind.value;
  const sourceColumn = getColumnById(conn.sourceHandle);
  const targetColumn = getColumnById(conn.targetHandle);

  if (sourceColumn && targetColumn
    && sourceColumn.isPrimaryKey
    && (targetColumn.isForeignKey || sourceColumn.isPrimaryKey)
  ) {
    const rel = new DbTableRelation({ 
      sourceTableId: sourceColumn.tableId,
      sourceColumnId: sourceColumn.id,
      targetTableId: targetColumn.tableId,
      targetColumnId: targetColumn.id,
      kind: relationKind
    });
    addRelation(rel);
  }
}

function onRelationChange(evs: EdgeChange[]) {
  for (const ev of evs) {
    switch (ev.type) {
      case 'remove': 
        if (ev.sourceHandle && ev.targetHandle) {
          removeRelation(ev.sourceHandle, ev.targetHandle);
        }
        break;
    }
  }
}

function onNodeChange(evs: NodeChange[]) {
  for (const ev of evs) {
    switch (ev.type) {
      case 'remove':
        removeTable(ev.id);
        break;
      case 'position':
        //TODO fix position change not handled
        break;
    }
  }
}


const generatedSql = ref<{ subject: string, sql: string }[]>([]);
const generatedSqlText = computed(() => generatedSql.value.map(stmt => stmt.sql).join("\n\n"));

function generateSql() {
  generatedSql.value = sqlEmitterService.emitSql();
}

const sqlCommitResult = ref('');

async function commitSql() {
  for (const stmt of generatedSql.value.filter(stmt => stmt.sql.length > 0)) {
    sqlCommitResult.value += stmt.subject + ':\n';
    try {
      const result = await executeDbQuery(stmt.sql);
      sqlCommitResult.value += result + '\n';
    } catch (err: any) {
      sqlCommitResult.value += err + '\n';
    }
    sqlCommitResult.value += '\n';
  }
}


</script>


<template>
  <div ref="designer" id="designer">
    <div id="designer-menubar">
      <Button @click="saveDesign" label="Save" icon="pi pi-save"/>
      <FileUpload mode="basic" accept="application/json" @select="loadDesign" custom-upload auto chooseLabel="Load" chooseIcon="pi pi-upload"/>

      <FloatLabel variant="on">
        <Select labelId="designerToolboxTableInheritanceKind" 
          v-model="designerToolboxTableInheritanceKind" 
          :options="designerToolboxAvailableTableInheritanceKinds" 
          optionLabel="label"
          size="small"
          />
        <label for="designerToolboxTableInheritanceKind">Table inheritance kind</label>
      </FloatLabel>

      <Button @click="generateSql">Generate SQL</Button>
    </div>
    <div id="designer-toolbox">
      <ButtonGroup>
        <ToggleButton v-model="designerToolboxTableMovingActive">Move</ToggleButton>
        <ToggleButton v-model="designerToolboxTableCreationActive">Add table</ToggleButton>
      </ButtonGroup>
      <ButtonGroup>
        <ToggleButton v-model="designerToolboxOneToOneRelActive">1-1</ToggleButton>
        <ToggleButton v-model="designerToolboxOneToManyRelActive">1-N</ToggleButton>
        <ToggleButton v-model="designerToolboxManyToManyRelActive">N-N</ToggleButton>
      </ButtonGroup>
    </div>
    <div id="designer-session">
      <h2>{{ dbName }}</h2><a href="#/disconnect">Logout</a>
    </div>

    <div id="designer-tool">
      <component 
        v-for="tool of enabledDesignerTools"
        :key="tool.id"
        :is="tool.cmp"
        ref="designerToolComponents"
      />
    </div>

    <div id="designer-output" v-if="generatedSqlText">
      <textarea>{{ generatedSqlText }}</textarea>
      <textarea :style="{ color: 'orange' }" placeholder="Errors and warnings">{{ sqlCommitResult }}</textarea>
      <ButtonGroup>
        <Button @click="generatedSql = []; sqlCommitResult = ''">Close</Button>
        <Button @click="commitSql">Commit</Button>
      </ButtonGroup>
    </div>

    <VueFlow 
      :nodes="nodes" :edges="edges" 
      :connection-mode="ConnectionMode.Strict" 
      :zoom-on-double-click="false"
      :nodes-draggable="tableMovingActive"
      @pane-click="(ev) => onDesignerClick(ev)"
      @connect="onConnectTables"
      @edges-change="ev => onRelationChange(ev)"
      @nodes-change="ev => onNodeChange(ev)"
      @node-drag-stop="ev => onTableDragEnd(ev)"
      @node-click="ev => onTableClick(ev)"
    >
      <Background pattern-color="#555" :gap="20"/>

      <template #node-table="nodeProps">
        <DbTableView :table-id="nodeProps.data" 
          @mousedown="ev => onTableMouseDown(ev, nodeProps.data as string)"
          @mouseup ="ev => onTableMouseUp(ev, nodeProps.data as string)"
        />
      </template>
      <template #edge-relation="edgeProps">
        <DbTableRelationView v-bind="edgeProps"/>
      </template>
    </VueFlow>
  </div>
</template>



<style scoped>

#designer {
  position: relative;

  height: 100vh;
  overflow: hidden;

  background-color: white;
}


#designer-menubar {
  display: flex;
  flex-direction: row;
  position: relative;
  top: 0.5em;
  left: 0.5em;

  width: fit-content;
  height: 2.6em;
  gap: 0.2em;
  margin-bottom: 1em;
}


#designer-toolbox {
  display: flex;
  flex-direction: row;
  position: fixed;
  top: 6em;
  left: 1em;

  padding: 0.5em 1em;
  width: fit-content;
  height: 3em;
  gap: 1.5em;

  background-color: white;
  z-index: 3;
  border-radius: 1em;
  border: 2px solid var(--p-primary-color);
}

#designer-toolbox .p-buttongroup {
  gap: 0.2em;
}

#designer-session {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  position: fixed;
  top: 0.2em;
  right: 1em;

  padding: 0.5em 1em;
  width: fit-content;
  gap: 1em;

  text-align: center;
}



#designer-tools {
  position: absolute;
  visibility: hidden;
}

#designer-output {
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 10em;
  right: 2em;

  width: 50rem;
  height: 60%;
  padding: 0.5em;
  gap: 0.5em;

  background-color: white;
  z-index: 10;
  border-radius: 1em;
  border: 2px solid var(--p-primary-color);
}

#designer-output > textarea {
  width: 100%;
  overflow: auto;
  font-family: 'Courier New', Courier, monospace;
}

#designer-output > textarea:nth-of-type(1) {
  flex: 60%;
}
#designer-output > textarea:nth-of-type(2) {
  flex: 30%;
  max-height: 10em;
}

.p-fileupload {
  display: inline-block;
  margin: 0;
}

</style>