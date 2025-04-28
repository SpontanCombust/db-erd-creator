<script setup lang="ts">

import { computed, onUpdated, reactive, ref, useTemplateRef, watch } from 'vue';
import { ConnectionMode, VueFlow, type Connection, type Edge, type EdgeChange, type Node, type NodeChange } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { storeToRefs } from 'pinia';
import { ToggleButton } from 'primevue';
import { Button } from 'primevue'

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



const { dbName } = useDbConnectionStore();


const designerRef = useTemplateRef('designer');


const designerStateStore = useDesignerStateStore();

const { 
  tableMovingActive,
  tableCreationActive,
  selectedTableRelationKind,
} = storeToRefs(designerStateStore);

const {
  setDesignerClientPosition,
  toggleTableMoving,
  toggleTableCreation,
  setSelectedTableRelationKind
} = designerStateStore;


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

watch(tableMovingActive, value => {
  toggleTableMoving(value);
});
watch(designerToolboxTableCreationActive, value => {

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

function onTableMouseDown(ev: MouseEvent, tab: DbTable) {
  designerToolRefs.value?.forEach(t => t?.tableMouseDown?.(ev, tab));
}

function onTableMouseUp(ev: MouseEvent, tab: DbTable) {
  designerToolRefs.value?.forEach(t => t?.tableMouseUp?.(ev, tab));
}

function onTableClick(ev: MouseEvent, tab: DbTable) {
  designerToolRefs.value?.forEach(t => t?.tableClick?.(ev, tab));
}


const { tables, removeTable } = useDbTableStore();
const { relations, addRelation, removeRelation } = useDbTableRelationStore();
const { getColumnByKey: getColumnById } = useDbTableColumnStore();

const nodes = computed<Node[]>(() => tables.map(t => ({
  id: t.id,
  position: { x: t.posX, y: t.posY },
  type: 'table',
  data: t.id,
} as Node)));

const edges = computed<Edge[]>(() => relations.map(r => ({
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
    && sourceColumn.keyType == 'PK'
    && targetColumn.keyType == 'FK'
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
    }
  }
}


const generatedSql = ref<{ subject: string, sql: string }[]>([]);
const generatedSqlText = computed(() => generatedSql.value.map(stmt => stmt.sql).join("\n\n"));

function generateSql() {
  const svc = new SqlEmitterService();
  generatedSql.value = svc.emitSql();
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
    <div id="designer-toolbox">
      <div>
        <h2>{{ dbName }}</h2><a href="#/disconnect">Logout</a>
      </div>
      <ToggleButton v-model="designerToolboxTableMovingActive">Move</ToggleButton>
      <ToggleButton v-model="designerToolboxTableCreationActive">Add table</ToggleButton>
      <ToggleButton v-model="designerToolboxOneToOneRelActive">Add 1-1 relation</ToggleButton>
      <ToggleButton v-model="designerToolboxOneToManyRelActive">Add 1-N relation</ToggleButton>
      <ToggleButton v-model="designerToolboxManyToManyRelActive">Add N-N relation</ToggleButton>
      <ToggleButton v-model="designerToolboxInheritanceRelActive">Add inheritence relation</ToggleButton>
      <Button @click="generateSql">Generate SQL</Button>
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
      <textarea :style="{ color: 'orange' }">{{ sqlCommitResult }}</textarea>
      <Button @click="generatedSql = []; sqlCommitResult = ''">Close</Button>
      <Button @click="commitSql">Commit</Button>
    </div>

    <VueFlow 
      :nodes="nodes" :edges="edges" 
      :connection-mode="ConnectionMode.Strict" 
      :nodes-draggable="tableMovingActive"
      @pane-click="(ev) => onDesignerClick(ev)"
      @connect="onConnectTables"
      @edges-change="ev => onRelationChange(ev)"
      @nodes-change="ev => onNodeChange(ev)"
    >
      <Background pattern-color="#555" :gap="20"/>

      <template #node-table="nodeProps">
        <DbTableView :table-id="nodeProps.data"/>
      </template>
      <template #edge-relation="edgeProps">
        <DbTableRelationView v-bind="edgeProps"/>
      </template>
    </VueFlow>
  </div>
</template>
