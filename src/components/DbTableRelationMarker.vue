<script setup lang="ts">
import { computed } from 'vue';


const props = withDefaults(defineProps<{
  id: string,
  type?: 'arrow' | 'fork'
  width?: number,
  height?: number,
  stroke?: string,
  strokeWidth?: number,
  fill?: string
}>(), {
  width: 20,
  height: 20,
  stroke: '#000',
  strokeWidth: 1,
  fill: '#000'
});


const refX = computed(() => {
  if (props.type == 'fork') {
    return "23";
  } else {
    return "10";
  }
});

</script>


<template>
  <svg class="vue-flow__marker vue-flow__container" width="50" height="50">
    <defs>
      <marker
        :id="id"
        class="vue-flow__arrowhead"
        viewBox="0 0 20 20"
        :refX="refX"
        refY="10"
        :markerWidth="width"
        :markerHeight="height"
        orient="auto-start-reverse"
      >
        <path v-if="type == 'fork'"
          :style="{ stroke, strokeWidth }"
          :fill="fill"
          stroke-linecap="square"
          d="M 0 10 L 15 0 M 0 10 L 15 10 M 0 10 L 15 20 Z"
        />
        <path v-if="type == 'arrow'"
          :style="{ stroke, strokeWidth }"
          :fill="fill"
          stroke-linecap="round"
          d="M 0 5 L 10 10 L 0 15 Z"
        />
      </marker>
    </defs>
  </svg>
</template>