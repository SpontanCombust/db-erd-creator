<script setup lang="ts">

import { computed } from 'vue';
import type { EdgeProps } from '@vue-flow/core';
import { SmoothStepEdge } from '@vue-flow/core';

import type DbTableRelation from '../model/DbTableRelation';
import DbTableRelationKind from '../model/DbTableRelationKind';
import DbTableRelationMarker from './DbTableRelationMarker.vue';


const props = defineProps<EdgeProps<DbTableRelation>>();


const startMarkerId = computed(() => {
  return `${props.id}-start-marker`;
});
const startMarkerType = computed(() => {
  switch (props.data.kind) {
    case DbTableRelationKind.ManyToMany: 
      return 'fork';
    default: 
      return undefined;
  }
});
const endMarkerId = computed(() => {
  return `${props.id}-end-marker`;
});
const endMarkerType = computed(() => {
  switch (props.data.kind) {
    case DbTableRelationKind.OneToMany:
    case DbTableRelationKind.ManyToMany: 
      return 'fork';
    case DbTableRelationKind.InheritsFrom: 
      return 'arrow';
    default: 
      return undefined;
  }
});

</script>


<template>
  <SmoothStepEdge
      :id="props.id"
      :source-x="props.sourceX"
      :source-y="props.sourceY"
      :target-x="props.targetX"
      :target-y="props.targetY"
      :source-position="props.sourcePosition"
      :target-position="props.targetPosition"
      :marker-start="`url(#${startMarkerId})`"
      :marker-end="`url(#${endMarkerId})`"
  />
  <DbTableRelationMarker v-if="startMarkerType" 
    :id="startMarkerId"
    :type="startMarkerType"
  />
  <DbTableRelationMarker v-if="endMarkerType" 
    :id="endMarkerId"
    :type="endMarkerType"
  />
</template>


<style lang="css">

.vue-flow__edge-path {
  stroke: rgb(100, 100, 100);
}

.vue-flow__edge.selected .vue-flow__edge-path {
  stroke: cornflowerblue;
}

</style>