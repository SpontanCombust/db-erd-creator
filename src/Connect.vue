<script setup lang="ts">

import { computed, onMounted, ref, watch } from 'vue';
import { Button } from 'primevue';

import { connectToDb, listOdbcDrivers } from './api/tauri';
import { defaultDbPort, filterSupportedDbKinds, readSupportedDbKind, SupportedDbKind } from './model/SupportedDbKind';
import { useDbConnectionStore } from './stores/DbConnectionStore';
import OdbcConnectionStringFactory from './services/OdbcConnectionStringFactory';
import { useService } from './composables/useService';


const connectionStringFactory = useService(OdbcConnectionStringFactory);


const availableDrivers = ref<string[]>([]);
const selectedDriver = ref('');
const selectedDbKind = computed(() => readSupportedDbKind(selectedDriver.value));
const driverError = ref('');

onMounted(async () => {
  try {
    availableDrivers.value = filterSupportedDbKinds(await listOdbcDrivers());
  } catch (err: any) {
    driverError.value = err;
  }

  if (availableDrivers.value.length > 0) {
    selectedDriver.value = availableDrivers.value[0];
  } else {
    driverError.value = "No driver found for supported databases";
  }
});


const formServer = ref('127.0.0.1');
const formPort = ref(0);
const formUser = ref('');
const formPassword = ref('');
const formDatabase = ref('');

watch(selectedDbKind, (value) => {
  if (value) {
    formPort.value = defaultDbPort(value);
  }
}, { immediate: true });


const connectionError = ref('');
const { storeConnection } = useDbConnectionStore();

async function tryConnecting() {
  try {
    if (selectedDbKind.value == undefined) {
      console.error("Unexpected: selected driver not supported");
      return;
    }

    let connString = '';
    switch (selectedDbKind.value) {
      case SupportedDbKind.SQLite:
        connString = connectionStringFactory.sqlite(selectedDriver.value, formDatabase.value);
        break;
      case SupportedDbKind.PostgreSQL:
        connString = connectionStringFactory.postgresql(selectedDriver.value, formServer.value, formPort.value, formDatabase.value, formUser.value, formPassword.value);
        break;
      case SupportedDbKind.MySQL:
        connString = connectionStringFactory.mysql(selectedDriver.value, formServer.value, formPort.value, formDatabase.value, formUser.value, formPassword.value)
        break;
      case SupportedDbKind.SQLServer:
        connString = connectionStringFactory.sqlserver(selectedDriver.value, formServer.value, formPort.value, formDatabase.value, formUser.value, formPassword.value)
        break;
    }

    if (connString != '') {
      await connectToDb(connString);
      storeConnection(selectedDriver.value, selectedDbKind.value, formDatabase.value);
  
      window.location.hash = '#/designer';
    }
  } catch (err: any) {
    connectionError.value = err;
  }
}

</script>


<template>
  <form @submit="">
    <label>
      Select ODBC driver
      <select v-model="selectedDriver">
        <option v-for="driv of availableDrivers" :value="driv">{{ driv }}</option>
      </select>
      <p :style="{ color: 'red' }">{{ driverError }}</p>
    </label>
  
    <template v-if="selectedDbKind == SupportedDbKind.SQLite">
      <label>
        Database file path
        <input type="text" v-model="formDatabase"/>
      </label>
    </template>
    <template v-else>
      <label>
        Server address
        <input type="text" v-model="formServer"/>
      </label>
      <label>
        Server port
        <input type="number" v-model="formPort"/>
      </label>
      <label>
        Database name
        <input type="text" v-model="formDatabase"/>
      </label>
      <label>
        User
        <input type="text" v-model="formUser"/>
      </label>
      <label>
        Password
        <input type="password" v-model="formPassword"/>
      </label>
    </template>
    
    <p :style="{ color: 'red' }">{{ connectionError }}</p>
    <Button @click="tryConnecting">Connect</Button>
  </form>
</template>


<style scoped>
  form {
    padding: 3%;
  }
  label {
    display: block;
  }
  label:first-of-type {
    margin-bottom: 1rem;
  }
  label:last-of-type {
    margin-bottom: 1rem;
  }
</style>