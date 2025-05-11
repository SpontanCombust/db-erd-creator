<script setup lang="ts">
import { computed } from 'vue';
import { Background } from '@vue-flow/background';
import { ConnectionMode, VueFlow, type Connection, type Edge, type EdgeChange, type Node, type NodeChange, type NodeDragEvent, type NodeMouseEvent } from '@vue-flow/core';
import { storeToRefs } from 'pinia';

import DbTableView from './DbTableView.vue';
import DbTableRelationView from './DbTableRelationView.vue';
import { useDbTableStore } from '@/stores/DbTableStore';
import { useDbTableColumnStore } from '@/stores/DbTableColumnStore';
import { useDbTableRelationStore } from '@/stores/DbTableRelationStore';
import DbTableRelation from '@/model/DbTableRelation';
import { useDesignerStateStore } from '@/stores/DesignerStateStore';


const emit = defineEmits<{
  designerClick: [MouseEvent],
  tableMouseDown: [MouseEvent, tableId: string]
  tableMouseUp: [MouseEvent, tableId: string]
  tableClick: [MouseEvent, tableId: string]
  tableMove: [x: number, y: number, tableId: string]
}>();


const { tables } = storeToRefs(useDbTableStore());
const { removeTable } = useDbTableStore();
const { getColumnByKey: getColumnById } = useDbTableColumnStore();
const { relations } = storeToRefs(useDbTableRelationStore());
const { addRelation, removeRelation } = useDbTableRelationStore();
const { tableMovingActive, selectedTableRelationKind } = storeToRefs(useDesignerStateStore());


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
        emit('tableMove', ev.position.x, ev.position.y, ev.id);
        break;
    }
  }
}

function onDesignerClick(ev: MouseEvent) {
  emit('designerClick', ev);
}

function onTableMouseDown(ev: MouseEvent, tableId: string) {
  emit('tableMouseDown', ev, tableId);
}

function onTableMouseUp(ev: MouseEvent, tableId: string) {
  emit('tableMouseUp', ev, tableId);
}

function onTableClick(ev: NodeMouseEvent) {
  const mouseEv = mouseEventFromNodeMouseEvent(ev);
  if (mouseEv) {
    const tableId = ev.node.data as string;
    emit('tableClick', mouseEv, tableId);
  }
}

function mouseEventFromNodeMouseEvent(ev: NodeMouseEvent) : MouseEvent | null {
  if (!('touches' in ev.event)) {
    return ev.event as MouseEvent;
  } else {
    return null;
  }
}


</script>


<template>
  <VueFlow 
    :nodes="nodes" :edges="edges" 
    :connection-mode="ConnectionMode.Strict" 
    :zoom-on-double-click="false"
    :nodes-draggable="tableMovingActive"
    @pane-click="(ev) => onDesignerClick(ev)"
    @connect="onConnectTables"
    @edges-change="ev => onRelationChange(ev)"
    @nodes-change="ev => onNodeChange(ev)"
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
</template>