<script setup lang="ts">
import { computed, ref } from 'vue';

import Home from './Home.vue';
import Connect from './Connect.vue';
import Designer from './Designer.vue';
import NotFound from './NotFound.vue';
import Disconnect from './Disconnect.vue';


const routes = {
  '/': Home,
  '/connect': Connect,
  '/designer': Designer,
  '/disconnect': Disconnect
};

const currentPath = ref(window.location.hash);

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash;
});

const currentView = computed(() => {
  const routePath = currentPath.value.slice(1) || '/';
  const routeComponent = Object.entries(routes)
    .filter(([p, _]) => p == routePath)
    .map(([_, c]) => c)
    .at(0)
    ?? NotFound;

  return routeComponent;
});

</script>


<template>
  <header>
    
  </header>

  <main>
    <component :is="currentView"/>
  </main>

  <footer>

  </footer>
</template>
