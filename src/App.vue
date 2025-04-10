<script setup lang="ts">

import { computed, onUpdated, reactive, ref, useTemplateRef } from 'vue';
import { ConnectionMode, VueFlow, type Connection, type Edge, type EdgeChange, type Node } from '@vue-flow/core';
import { Background } from '@vue-flow/background';

import DbTable from './model/DbTable';
import DbTableView from './DbTableView.vue';
import DesignerState from './model/DesignerState';
import { provideDesignerState } from './composables/useDesignerState';
import DesignerToolMode from './model/DesignerToolMode';
import MoveDesignerTool from './MoveDesignerTool.vue';
import AddTableDesignerTool from './AddTableDesignerTool.vue';
import DbTableRelation from './model/DbTableRelation';
import DbTableRelationKind from './model/DbTableRelationKind';
import DbTableColumn from './model/DbTableColumn';
import SqlEmitterService from './services/SqlEmitterService';
import DbTableRelationView from './DbTableRelationView.vue';



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


const nodes = computed<Node[]>(() => designerState.tables.map(t => ({
  id: t.id,
  position: t.designerPosition,
  type: 'table',
  data: t,
} as Node)));

const edges = computed<Edge[]>(() => designerState.relations.map(r => ({
  id: r.connectedFromColumn.id + '--' + r.connectedToColumn.id,
  source: r.connectedFromTable.id,
  sourceHandle: r.connectedFromColumn.id,
  target: r.connectedToTable.id,
  targetHandle: r.connectedToColumn.id,
  type: 'relation',
  data: r
} as Edge)));


function onConnectTables(params: Connection) {
  if (!params.sourceHandle || !params.targetHandle // make sure handles are valid
    || params.source == params.target // make sure you cannot connect table to itself
  ) {
    return;
  }

  let relationType: DbTableRelationKind;
  switch (designerState.toolMode) {
    case DesignerToolMode.AddRelation11:
      relationType = DbTableRelationKind.OneToOne;
      break;
    case DesignerToolMode.AddRelation1N:
      relationType = DbTableRelationKind.OneToMany;
      break;
    case DesignerToolMode.AddRelationNN:
      relationType = DbTableRelationKind.ManyToMany;
      break;
    case DesignerToolMode.AddRelationInheritance:
      relationType = DbTableRelationKind.InheritsFrom;
      break;
    default:
      relationType = DbTableRelationKind.OneToOne;
  }

  let srcTable: DbTable | null = null;
  let srcColumn: DbTableColumn | null = null;
  let dstTable: DbTable | null = null;
  let dstColumn: DbTableColumn | null = null;

  for (const tab of designerState.tables) {
    for (const col of tab.columns) {
      if (col.id == params.sourceHandle && col.keyType == 'PK') {
        srcTable = tab;
        srcColumn = col;
      }
      else if (col.id == params.targetHandle && col.keyType == 'FK') {
        dstTable = tab;
        dstColumn = col;
      }
    }
  }

  if (srcTable && srcColumn && dstTable && dstColumn) {
    designerState.relations.push(new DbTableRelation(srcTable, srcColumn, dstTable, dstColumn, relationType));
  }
}

function onRelationChange(evs: EdgeChange[]) {
  for (const ev of evs) {
    if (ev.type == 'remove') {
      const relIdx = designerState.relations.findIndex(rel => 
        rel.connectedFromColumn.id == ev.sourceHandle && rel.connectedToColumn.id == ev.targetHandle
      );
      designerState.relations.splice(relIdx, 1);
    }
  }
}


const generatedSql = ref('');

function generateSql() {
  const svc = new SqlEmitterService();
  generatedSql.value = svc.emitSql(designerState.tables, designerState.relations);
}


</script>


<template>
  <header>
    
  </header>

  <main>
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

      <div id="designer-output" v-if="generatedSql">
        <textarea>{{ generatedSql }}</textarea>
        <button @click="generatedSql = ''">Close</button>
      </div>

      <VueFlow :nodes="nodes" :edges="edges" :connection-mode="ConnectionMode.Strict" 
        @pane-click="(ev) => onDesignerClick(ev)"
        @connect="onConnectTables"
        @edges-change="ev => onRelationChange(ev)"
      >
        <Background pattern-color="#555" :gap="20"/>

        <template #node-table="nodeProps">
          <DbTableView :model="nodeProps.data"/>
        </template>
        <template #edge-relation="edgeProps">
          <DbTableRelationView v-bind="edgeProps"/>
        </template>
      </VueFlow>
    </div>
  </main>

  <footer>

  </footer>
</template>
