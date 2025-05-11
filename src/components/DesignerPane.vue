<script setup lang="ts">
import { computed } from 'vue';
import { Background } from '@vue-flow/background';
import { ConnectionMode, VueFlow, type Connection, type Edge, type EdgeChange, type Node, type NodeChange, type NodeMouseEvent } from '@vue-flow/core';
import { storeToRefs } from 'pinia';

import DbTableView from './DbTableView.vue';
import DbTableRelationView from './DbTableRelationView.vue';
import { useDbTableStore } from '@/stores/DbTableStore';
import { useDbTableRelationStore } from '@/stores/DbTableRelationStore';
import DbTableRelation from '@/model/DbTableRelation';
import { useDesignerStateStore } from '@/stores/DesignerStateStore';
import DbTableRelationKind from '@/model/DbTableRelationKind';
import { useService } from '@/composables/useService';
import DesignManagerService from '@/services/DesignManagerService';


const emit = defineEmits<{
  designerClick: [MouseEvent],
  tableMouseDown: [MouseEvent, tableId: string]
  tableMouseUp: [MouseEvent, tableId: string]
  tableClick: [MouseEvent, tableId: string]
  tableMove: [x: number, y: number, tableId: string]
}>();


const { tables } = storeToRefs(useDbTableStore());
const { removeTable } = useDbTableStore();
const { relations } = storeToRefs(useDbTableRelationStore());
const { addRelation, removeColumnRelationByKey, removeTableRelationByKey } = useDbTableRelationStore();
const { tableMovingActive, selectedTableRelationKind } = storeToRefs(useDesignerStateStore());

const designManagerService = useService(DesignManagerService);


const nodes = computed<Node[]>(() => tables.value.map(t => ({
  id: t.id,
  position: { x: t.posX, y: t.posY },
  type: 'table',
  data: t.id,
} as Node)));

const edges = computed<Edge[]>(() => relations.value.map(r => {
  let id: string;
  let sourceHandle: string | undefined;
  let targetHandle: string | undefined;

  if (r.kind == DbTableRelationKind.InheritsFrom) {
    id = r.sourceTableId + '--' + r.sourceTableId;
    sourceHandle = r.sourceTableId;
    targetHandle = r.targetTableId;
  } else {
    id = r.sourceColumnId + '--' + r.targetColumnId;
    sourceHandle = r.sourceColumnId;
    targetHandle = r.targetColumnId;
  }

  return {
    id,
    source: r.sourceTableId,
    sourceHandle,
    target: r.targetTableId,
    targetHandle,
    type: 'relation',
    data: r
  } as Edge;
}));



function analyzeConnection(source: string, sourceHandle: string | null | undefined, target: string, targetHandle: string | null | undefined) 
: {
    connectionType: 'inheritance' 
    sourceTableId: string,
    targetTableId: string
  } | {
    connectionType: 'composition'
    sourceTableId: string,
    sourceColumnId: string,
    targetTableId: string,
    targetColumnId: string
  } | {
    connectionType: 'invalid'
  }
{
  if (!sourceHandle || !targetHandle) {
    return {
      connectionType: 'invalid'
    }
  }

  const sourceTableId = source;
  const targetTableId = target;

  const isSourceAColumn = sourceTableId != sourceHandle;
  const isTargetAColumn = targetTableId != targetHandle;

  const isCompositionConnection = isSourceAColumn && isTargetAColumn;
  const isInheritanceConnection = !isSourceAColumn && !isTargetAColumn;

  if (isCompositionConnection) {
    const sourceColumnId =  sourceHandle;
    const targetColumnId = targetHandle;

    return {
      connectionType: 'composition',
      sourceTableId,
      sourceColumnId,
      targetTableId,
      targetColumnId,
    }
  } 
  else if (isInheritanceConnection) {
    return {
      connectionType: 'inheritance',
      sourceTableId,
      targetTableId
    }
  } else {
    return {
      connectionType: 'invalid'
    }
  }
}


function onConnectTables(conn: Connection) {
  const analysis = analyzeConnection(conn.source, conn.sourceHandle, conn.target, conn.targetHandle);

  if (analysis.connectionType == 'composition') {
    const relationKind = selectedTableRelationKind.value;

    if (!designManagerService.isNewColumnConnectionValid(analysis.sourceTableId, analysis.sourceColumnId, analysis.targetTableId, analysis.targetColumnId, relationKind)) {
      return;
    }
    
    const rel = new DbTableRelation({ 
      sourceTableId: analysis.sourceTableId,
      sourceColumnId: analysis.sourceColumnId,
      targetTableId: analysis.targetTableId,
      targetColumnId: analysis.targetColumnId,
      kind: relationKind
    });
    
    addRelation(rel);
  } 
  else if (analysis.connectionType == 'inheritance') {
    if (!designManagerService.isNewTableConnectionValid(analysis.sourceTableId, analysis.targetTableId)) {
      return;
    }

    const rel = new DbTableRelation({ 
      sourceTableId: analysis.sourceTableId,
      sourceColumnId: undefined,
      targetTableId: analysis.targetTableId,
      targetColumnId: undefined,
      kind: DbTableRelationKind.InheritsFrom
    });
    
    addRelation(rel);
  }
}

function onRelationChange(evs: EdgeChange[]) {
  for (const ev of evs) {
    switch (ev.type) {
      case 'remove': 
        const analysis = analyzeConnection(ev.source, ev.sourceHandle, ev.target, ev.targetHandle);

        if (analysis.connectionType == 'inheritance') {
          removeTableRelationByKey(analysis.sourceTableId, analysis.targetTableId);
        } else if (analysis.connectionType == 'composition'){
          removeColumnRelationByKey(analysis.sourceColumnId, analysis.targetColumnId);
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
        if (ev.position) {
          emit('tableMove', ev.position.x, ev.position.y, ev.id);
        }
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