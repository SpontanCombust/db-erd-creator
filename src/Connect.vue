<script setup lang="ts">

import { computed, onMounted, ref, watch } from 'vue';
import { Button, Select, InputText, InputNumber, FloatLabel } from 'primevue';
import * as tauriDialog from '@tauri-apps/plugin-dialog';

import { connectToDb, listOdbcDrivers } from './api/tauri';
import { defaultDbPort, filterSupportedDbKinds, readSupportedDbKind, SupportedDbKind } from './model/SupportedDbKind';
import { useDbConnectionStore } from './stores/DbConnectionStore';
import OdbcConnectionStringFactory from './services/OdbcConnectionStringFactory';
import { useService } from './composables/useService';


const connectionStringFactory = useService(OdbcConnectionStringFactory);


const availableDbKinds = function() {
  return Object.keys(SupportedDbKind)
    .map(k => Number(k))
    .filter(k => !isNaN(k))
    .map(k => ({
      value: k as SupportedDbKind,
      label: SupportedDbKind[k]
    }));
}();
const selectedDbKind = ref<SupportedDbKind>(SupportedDbKind.SQLite);

const availableDrivers = ref<string[]>([]);
const availableDbKindDrivers = computed(() => {
  return availableDrivers.value
    .filter(driv => readSupportedDbKind(driv) == selectedDbKind.value)
});
const selectedDriver = ref<string | undefined>(undefined);
const driverError = ref('');

onMounted(async () => {
  try {
    availableDrivers.value = filterSupportedDbKinds(await listOdbcDrivers());
  } catch (err: any) {
    driverError.value = err;
  }

  selectedDriver.value = availableDbKindDrivers.value.at(0);
});

watch(selectedDbKind, value => {
  selectedDriver.value = availableDbKindDrivers.value.at(0);
});


const formServer = ref('127.0.0.1');
const formPort = ref(0);
const formUser = ref('');
const formPassword = ref('');
const formDatabase = ref('');

watch(selectedDbKind, (value) => {
  if (value) {
    formPort.value = defaultDbPort(value);
    formDatabase.value = '';
  }
}, { immediate: true });

async function browseSqliteDb() {
  const filePath = await tauriDialog.open({
    title: 'Choose SQLite database file',
    filters: [
      { name: 'SQLite Database Files', extensions: ['sqlite', 'db'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (filePath) {
    formDatabase.value = filePath;
  }
}

async function newSqliteDb() {
  const filePath = await tauriDialog.save({
    title: 'Create SQLite database file',
    filters: [
      { name: 'SQLite Database Files', extensions: ['sqlite', 'db'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (filePath) {
    formDatabase.value = filePath;
  }
}

const connectionError = ref('');
const { storeConnection } = useDbConnectionStore();

async function tryConnecting() {
  if (!selectedDriver.value) {
    return;
  }

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
      storeConnection(selectedDriver.value, selectedDbKind.value, formDatabase.value, connString);
  
      window.location.hash = '#/designer';
    }
  } catch (err: any) {
    connectionError.value = err;
  }
}

</script>


<template>
  <form @submit.prevent="">
    <FloatLabel variant="on" class="form-input">
      <Select id="selectedDbKind" labelId="selectedDbKindLabel" 
        v-model="selectedDbKind" 
        :options="availableDbKinds"
        option-value="value"
        option-label="label" 
      />
      <label for="selectedDbKindLabel">Select database provider</label>
    </FloatLabel>
    <FloatLabel variant="on" class="form-input">
      <Select id="selectedDriver" labelId="selectedDriverLabel" 
        v-model="selectedDriver" 
        :options="availableDbKindDrivers" 
        empty-message="None installed for this provider"
      />
      <label for="selectedDriverLabel">Select ODBC driver</label>
      <p :style="{ color: 'red' }">{{ driverError }}</p>
    </FloatLabel>
  
    <template v-if="selectedDbKind == SupportedDbKind.SQLite">
      <div id="sqlite-db" class="form-input">
        <FloatLabel variant="on" class="full-width">
          <InputText id="formDatabase" class="full-width" type="text" v-model="formDatabase" readonly disabled/>
          <label for="formDatabase">Database file path</label>
        </FloatLabel>
        <Button @click="browseSqliteDb" icon="pi pi-upload" label="Browse"/>
        <Button @click="newSqliteDb" icon="pi pi-plus-circle" label="New"/>
      </div>
    </template>
    <template v-else>
      <FloatLabel variant="on" class="form-input">
        <InputText id="formServer" type="text" v-model="formServer"/>
        <label for="formServer">Server address</label>
      </FloatLabel>
      <FloatLabel variant="on" class="form-input">
        <InputNumber inputId="formPort" type="number" v-model="formPort" :useGrouping="false" :min="0" :max="65535"/>
        <label for="formPort">Server port</label>
      </FloatLabel>
      <FloatLabel variant="on" class="form-input">
        <InputText id="formDatabase" type="text" v-model="formDatabase"/>
        <label for="formDatabase">Database name</label>
      </FloatLabel>
      <FloatLabel variant="on" class="form-input">
        <InputText id="formUser" type="text" v-model="formUser"/>
        <label for="formUser">User</label>
      </FloatLabel>
      <FloatLabel variant="on" class="form-input">
        <InputText id="formPassword" type="password" v-model="formPassword"/>
        <label for="formPassword">Password</label>
      </FloatLabel>
    </template>
    
    <p :style="{ color: 'red' }">{{ connectionError }}</p>
    <Button id="connectBtn" @click="tryConnecting" :disabled="!selectedDriver">Connect</Button>
  </form>
</template>


<style scoped>
  .form-input {
    display: flex;
    flex-direction: column;
    width: 25em;
  }


  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: 98vh;
    padding: 3%;
    gap: 0.4em;
  }

  form > * {
    min-width: 30em;
  }

  #sqlite-db {
    display: flex;
    flex-direction: row;
    gap: 0.1em;
    justify-content: center;
  }

  #sqlite-db > span {
    flex: auto;
  }

  #sqlite-db > button {
    min-width: fit-content;
    padding: 0 1em;
  }

  #sqlite-db input[type="text"] {
    min-width: 25em;
  }

  #selectedDriver {
    margin-bottom: 2em;
  }

  #connectBtn {
    margin-top: 1em;
  }

</style>