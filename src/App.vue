<script setup lang="ts">

import { computed, onUpdated, reactive, useTemplateRef } from 'vue';

import DbTable from './model/DbTable';
import DbTableView from './DbTableView.vue';
import DesignerState from './model/DesignerState';
import { provideDesignerState } from './composables/useDesignerState';
import DesignerToolMode from './model/DesignerToolMode';
import MoveDesignerTool from './MoveDesignerTool.vue';
import AddTableDesignerTool from './AddTableDesignerTool.vue';


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

</script>


<template>
  <header>
    
  </header>

  <main>
    <div ref="designer" id="designer" @click.self="onDesignerClick">
      <div id="designer-toolbox">
        <button @click="designerState.toolMode = DesignerToolMode.Move">Move</button>
        <button @click="designerState.toolMode = DesignerToolMode.AddTable">Add table</button>
        <button @click="designerState.toolMode = DesignerToolMode.AddRelation11">Add 1-1 relation</button>
        <button @click="designerState.toolMode = DesignerToolMode.AddRelation1N">Add 1-N relation</button>
        <button @click="designerState.toolMode = DesignerToolMode.AddRelationNN">Add N-N relation</button>
        <button @click="designerState.toolMode = DesignerToolMode.AddRelationInheritance">Add inheritence relation</button>
      </div>
      <div id="designer-tool">
        <component :is="designerToolComponent" ref="designerTool"/>
      </div>

      <div id="designer-tables">
        <template v-for="t of designerState.tables">
          <DbTableView :model="t"
            @mousedown="(ev) => onTableMouseDown(ev, t)"
            @mouseup="(ev) => onTableMouseUp(ev, t)"
            @click="(ev) => onTableClick(ev, t)"
          />
        </template>
      </div>
      <div id="designer-table-relations">
        <template v-for="r of designerState.relations">

        </template>
      </div>
    </div>
  </main>

  <footer>

  </footer>
</template>
