<script setup lang="ts">

import { computed, onUpdated, reactive, ref, useTemplateRef } from 'vue';
import { ConnectionMode, VueFlow, type Connection, type Edge, type EdgeChange, type Node, type NodeChange } from '@vue-flow/core';
import { Background } from '@vue-flow/background';

import DbTable from './model/DbTable';
import DbTableView from './components/DbTableView.vue';
import DesignerState from './model/DesignerState';
import { provideDesignerState } from './composables/useDesignerState';
import DesignerToolMode from './model/DesignerToolMode';
import MoveDesignerTool from './components/MoveDesignerTool.vue';
import AddTableDesignerTool from './components/AddTableDesignerTool.vue';
import DbTableRelation from './model/DbTableRelation';
import DbTableRelationKind from './model/DbTableRelationKind';
import SqlEmitterService from './services/SqlEmitterService';
import DbTableRelationView from './components/DbTableRelationView.vue';
import { useDbTableStore } from './stores/DbTableStore';
import { useDbTableRelationStore } from './stores/DbTableRelationStore';
import { useDbTableColumnStore } from './stores/DbTableColumnStore';
import { executeDbQuery } from './api/tauri';



const designerRef = useTemplateRef('designer');

const designerState = reactive(new DesignerState());
provideDesignerState(designerState);

onUpdated(() => {
  const bcr = designerRef.value?.getBoundingClientRect() ?? new DOMRect();
  designerState.clientX = bcr.x;
  designerState.clientY = bcr.y;
});


const designerToolRef = useTemplateRef('designerTool');

const designerToolComponent = computed(() => {
  if (designerState.toolMode == DesignerToolMode.Move) {
    return MoveDesignerTool;
  } 
  else if (designerState.toolMode == DesignerToolMode.AddTable) {
    return AddTableDesignerTool;
  } 
  else {
    return MoveDesignerTool;
  }
});

function onDesignerClick(ev: MouseEvent) {
  designerToolRef.value?.designerClick?.(ev);
}

function onTableMouseDown(ev: MouseEvent, tab: DbTable) {
  designerToolRef.value?.tableMouseDown?.(ev, tab);
}

function onTableMouseUp(ev: MouseEvent, tab: DbTable) {
  designerToolRef.value?.tableMouseUp?.(ev, tab);
}

function onTableClick(ev: MouseEvent, tab: DbTable) {
  designerToolRef.value?.tableClick?.(ev, tab);
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

  let relationKind: DbTableRelationKind;
  switch (designerState.toolMode) {
    case DesignerToolMode.AddRelation11:
      relationKind = DbTableRelationKind.OneToOne;
      break;
    case DesignerToolMode.AddRelation1N:
      relationKind = DbTableRelationKind.OneToMany;
      break;
    case DesignerToolMode.AddRelationNN:
      relationKind = DbTableRelationKind.ManyToMany;
      break;
    case DesignerToolMode.AddRelationInheritance:
      relationKind = DbTableRelationKind.InheritsFrom;
      break;
    default:
      relationKind = DbTableRelationKind.OneToOne;
  }

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


const generatedSql = ref<string[]>([]);
const generatedSqlText = computed(() => generatedSql.value.join("\n"));

function generateSql() {
  const svc = new SqlEmitterService();
  generatedSql.value = svc.emitSql();
}

const sqlCommitResult = ref('');

async function commitSql() {
  try {
    for (const sql of generatedSql.value) {
      const result = await executeDbQuery(sql);
      sqlCommitResult.value = result;
    }
  } catch (err: any) {
    sqlCommitResult.value = err;
  }
}


</script>


<template>
  <div ref="designer" id="designer">
    <div id="designer-toolbox">
      <button @click="designerState.toolMode = DesignerToolMode.Move">Move</button>
      <button @click="designerState.toolMode = DesignerToolMode.AddTable">Add table</button>
      <button @click="designerState.toolMode = DesignerToolMode.AddRelation11">Add 1-1 relation</button>
      <button @click="designerState.toolMode = DesignerToolMode.AddRelation1N">Add 1-N relation</button>
      <button @click="designerState.toolMode = DesignerToolMode.AddRelationNN">Add N-N relation</button>
      <button @click="designerState.toolMode = DesignerToolMode.AddRelationInheritance">Add inheritence relation</button>
      <button @click="generateSql">Generate SQL</button>
    </div>

    <div id="designer-tool">
      <component :is="designerToolComponent" ref="designerTool"/>
    </div>

    <div id="designer-output" v-if="generatedSqlText">
      <textarea>{{ generatedSqlText }}</textarea>
      <p :style="{ color: 'orange' }">{{ sqlCommitResult }}</p>
      <button @click="generatedSqlText = ''">Close</button>
      <button @click="commitSql">Commit</button>
    </div>

    <VueFlow :nodes="nodes" :edges="edges" :connection-mode="ConnectionMode.Strict" 
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
