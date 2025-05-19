<script setup lang="ts">

import { computed, onMounted, onUpdated, ref, useTemplateRef, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { Button, ButtonGroup, FileUpload, FloatLabel, Select, ToggleButton, type FileUploadSelectEvent } from 'primevue';
import { Codemirror } from 'vue-codemirror';
import { sql as codeMirrorSql } from '@codemirror/lang-sql'
import * as tauriDialog from '@tauri-apps/plugin-dialog';
import * as tauriFs from '@tauri-apps/plugin-fs';

import AddTableDesignerTool from './components/AddTableDesignerTool.vue';
import DbTableRelationKind from './model/DbTableRelationKind';
import SqlEmitterService from './services/SqlEmitterService';
import { executeDbQuery } from './api/tauri';
import { useDbConnectionStore } from './stores/DbConnectionStore';
import { useDesignerStateStore } from './stores/DesignerStateStore';
import MoveDesignerTool from './components/MoveDesignerTool.vue';
import { useService } from './composables/useService';
import JsonImportExportService from './services/JsonImportExportService';
import DbTableInheritanceKind from './model/DbTableInheritanceKind';
import DesignerPane from './components/DesignerPane.vue';
import DesignPersistenceService from './services/DesignPersistenceService';
import DesignChangeIndicator from './components/DesignChangeIndicator.vue';


const sqlEmitterService = useService(SqlEmitterService);
const jsonPersistenceService = useService(JsonImportExportService);
const designPersistenceService = useService(DesignPersistenceService);

const { dbName } = useDbConnectionStore();
const designerStateStore = useDesignerStateStore();

const { 
  tableMovingActive,
  tableCreationActive,
  selectedTableRelationKind,
  selectedTableInheritanceKind
} = storeToRefs(designerStateStore);

const {
  setDesignerClientPosition,
  toggleTableMoving,
  toggleTableCreation,
  setSelectedTableRelationKind,
  setSelectedTableInheritanceKind
} = designerStateStore;



const designChangeDetected = ref(true);

async function loadLatestDesign() {
  try {
    await designPersistenceService.loadCurrentDesignFromDatabase();
  } catch (err: any) {
    err = 'Failed to load latest design from database\n' + err;
    tauriDialog.message(err, { title: 'Database error', kind: 'error' })
  }
}

async function saveDesign() {
  try {
    await designPersistenceService.saveCurrentDesignToDatabase();
    designChangeDetected.value = false;
  } catch (err: any) {
    err = 'Failed to save design to database\n' + err;
    tauriDialog.message(err, { title: 'Database error', kind: 'error' })
  }
}

async function importDesign(ev: FileUploadSelectEvent) {
  if (ev.files) {
    const file = ev.files instanceof File ? ev.files : ev.files.at(0);
    if (!file) {
      return;
    }
    
    const json = await file.text();

    try {
      jsonPersistenceService.importDesignFromJson(json);
    } catch (err: any) {
      console.error(err);
    }
  }
}

async function exportDesign() {
  const filePath = await tauriDialog.save({
    title: 'Save design',
    defaultPath: `${dbName}.json`,
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  const json = jsonPersistenceService.exportCurrentDesignToJson();

  if (filePath) {
    await tauriFs.writeTextFile(filePath, json);
  }
}


onMounted(async () => {
  await loadLatestDesign();
  designChangeDetected.value = false;
});



const designerRef = useTemplateRef('designer');

onUpdated(() => {
  const bcr = designerRef.value?.getBoundingClientRect() ?? new DOMRect();
  setDesignerClientPosition(bcr.x, bcr.y);
});


const designerToolboxTableMovingActive = computed({
  get() {
    return tableMovingActive.value;
  },
  set(value) {
    toggleTableMoving(value);
  }
});
const designerToolboxTableCreationActive = computed({
  get() {
    return tableCreationActive.value;
  },
  set(value) {
    toggleTableCreation(value);
  }
});
const designerToolboxOneToOneRelActive = computed({
  get() {
    return selectedTableRelationKind.value == DbTableRelationKind.OneToOne;
  },
  set(value) {
    if (value) {
      setSelectedTableRelationKind(DbTableRelationKind.OneToOne);
    }
  }
});
const designerToolboxOneToManyRelActive = computed({
  get() {
    return selectedTableRelationKind.value == DbTableRelationKind.OneToMany;
  },
  set(value) {
    if (value) {
      setSelectedTableRelationKind(DbTableRelationKind.OneToMany);
    }
  }
});
const designerToolboxManyToManyRelActive = computed({
  get() {
    return selectedTableRelationKind.value == DbTableRelationKind.ManyToMany;
  },
  set(value) {
    if (value) {
      setSelectedTableRelationKind(DbTableRelationKind.ManyToMany);
    }
  }
});

const designerToolboxAvailableTableInheritanceKinds = [
  {
    label: "Single Table Inheritance",
    value: DbTableInheritanceKind.SingleTable
  },
  {
    label: "Class Table Inheritance",
    value: DbTableInheritanceKind.ClassTable
  },
  {
    label: "Concrete Table Inheritance",
    value: DbTableInheritanceKind.ConcreteTable
  }
];
const designerToolboxTableInheritanceKind = ref(function() {
  return designerToolboxAvailableTableInheritanceKinds
    .find(k => k.value == selectedTableInheritanceKind.value)
    ?? designerToolboxAvailableTableInheritanceKinds[0];
}())
watch(designerToolboxTableInheritanceKind, value => {
  setSelectedTableInheritanceKind(value.value);
});


const designerTools = computed(() => ([
  {
    id: 'Move',
    cmp: MoveDesignerTool,
    enabled: tableMovingActive.value
  },
  {
    id: 'AddTable',
    cmp: AddTableDesignerTool,
    enabled: tableCreationActive.value
  },
]));

const enabledDesignerTools = computed(() => {
  return designerTools.value
    .filter(c => c.enabled)
});



const designerToolRefs = useTemplateRef('designerToolComponents');

function onDesignerClick(ev: MouseEvent) {
  designerToolRefs.value?.forEach(t => t?.designerClick?.(ev));
}

function onTableMouseDown(ev: MouseEvent, tableId: string) {
  designerToolRefs.value?.forEach(t => t?.tableMouseDown?.(ev, tableId));
}

function onTableMouseUp(ev: MouseEvent, tableId: string) {
  designerToolRefs.value?.forEach(t => t?.tableMouseUp?.(ev, tableId));
}

function onTableClick(ev: MouseEvent, tableId: string) {
  designerToolRefs.value?.forEach(t => t?.tableClick?.(ev, tableId));
}

function onTableMove(x: number, y: number, tableId: string) {
  designerToolRefs.value?.forEach(t => t?.tableMove?.(x, y, tableId));
}



const generatedSql = ref<{ subject: string, sql: string }[]>([]);
const generatedSqlText = computed(() => generatedSql.value.map(stmt => stmt.sql).join("\n\n"));

function generateSql() {
  generatedSql.value = sqlEmitterService.emitSql();
}

const sqlCommitResult = ref('');

async function commitSql() {
  for (const stmt of generatedSql.value.filter(stmt => stmt.sql.length > 0)) {
    sqlCommitResult.value += stmt.subject + ':\n';
    try {
      const result = await executeDbQuery(stmt.sql);
      sqlCommitResult.value += result + '\n';
    } catch (err: any) {
      sqlCommitResult.value += err + '\n';
    }
    sqlCommitResult.value += '\n';
  }
}


</script>


<template>
  <div ref="designer" id="designer" @keydown.ctrl.s="saveDesign" tabindex="0">
    <div id="designer-menubar">
      <div id="save-btn-wrapper">
        <Button @click="saveDesign" label="Save" icon="pi pi-save"/>
        <DesignChangeIndicator v-model="designChangeDetected"/>
      </div>
      <FileUpload mode="basic" accept="application/json" @select="importDesign" custom-upload auto chooseLabel="Import" chooseIcon="pi pi-upload"/>
      <Button @click="exportDesign" label="Export" icon="pi pi-download"></Button>

      <FloatLabel variant="on">
        <Select labelId="designerToolboxTableInheritanceKind" 
          v-model="designerToolboxTableInheritanceKind" 
          :options="designerToolboxAvailableTableInheritanceKinds" 
          optionLabel="label"
          size="small"
          />
        <label for="designerToolboxTableInheritanceKind">Table inheritance kind</label>
      </FloatLabel>

      <Button @click="generateSql">Generate SQL</Button>
    </div>
    <div id="designer-toolbox">
      <ButtonGroup>
        <ToggleButton v-model="designerToolboxTableMovingActive">Move</ToggleButton>
        <ToggleButton v-model="designerToolboxTableCreationActive">Add table</ToggleButton>
      </ButtonGroup>
      <ButtonGroup>
        <ToggleButton v-model="designerToolboxOneToOneRelActive">1-1</ToggleButton>
        <ToggleButton v-model="designerToolboxOneToManyRelActive">1-N</ToggleButton>
        <ToggleButton v-model="designerToolboxManyToManyRelActive">N-N</ToggleButton>
      </ButtonGroup>
    </div>
    <div id="designer-session">
      <h2>{{ dbName }}</h2><a href="#/disconnect">Logout</a>
    </div>

    <div id="designer-tool">
      <component 
        v-for="tool of enabledDesignerTools"
        :key="tool.id"
        :is="tool.cmp"
        ref="designerToolComponents"
      />
    </div>

    <div id="designer-output" v-if="generatedSqlText">
      <div id="designer-output-sql">
        <Codemirror 
          v-model="generatedSqlText"
          :indent-with-tab="true"
          :tab-size="2"
          :extensions="[codeMirrorSql()]"
          :disabled="true"
          :options="{ theme: 'eclipse' }"
        />
      </div>
      <textarea id="designer-output-errors" :style="{ color: 'orange' }" placeholder="Errors and warnings">{{ sqlCommitResult }}</textarea>
      <ButtonGroup>
        <Button @click="generatedSql = []; sqlCommitResult = ''">Close</Button>
        <Button @click="commitSql">Commit</Button>
      </ButtonGroup>
    </div>

    <DesignerPane
      @designer-click="onDesignerClick"
      @table-mouse-down="onTableMouseDown"
      @table-mouse-up="onTableMouseUp"
      @table-click="onTableClick"
      @table-move="onTableMove"
    />
  </div>
</template>



<style scoped>

#designer {
  position: relative;

  height: 100vh;
  overflow: hidden;

  background-color: white;
}


#designer-menubar {
  display: flex;
  flex-direction: row;
  position: relative;
  top: 0.5em;
  left: 0.5em;

  width: fit-content;
  height: 2.6em;
  gap: 0.2em;
  margin-bottom: 1em;
}

#save-btn-wrapper {
  position: relative;
}


#designer-toolbox {
  display: flex;
  flex-direction: row;
  position: fixed;
  top: 6em;
  left: 1em;

  padding: 0.5em 1em;
  width: fit-content;
  height: 3em;
  gap: 1.5em;

  background-color: white;
  z-index: 3;
  border-radius: 1em;
  border: 2px solid var(--p-primary-color);
}

#designer-toolbox .p-buttongroup {
  gap: 0.2em;
}

#designer-session {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  position: fixed;
  top: 0.2em;
  right: 1em;

  padding: 0.5em 1em;
  width: fit-content;
  gap: 1em;

  text-align: center;
}



#designer-tools {
  position: absolute;
  visibility: hidden;
}

#designer-output {
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 10em;
  right: 2em;

  width: 50rem;
  height: 70%;
  padding: 0.5em;
  gap: 0.5em;

  background-color: white;
  z-index: 10;
  border-radius: 1em;
  border: 2px solid var(--p-primary-color);
}

#designer-output > textarea {
  width: 100%;
  overflow: auto;
  font-family: 'Courier New', Courier, monospace;
}

#designer-output-sql {
  flex: 60%;
  overflow: auto;
}

#designer-output-errors {
  flex: 30%;
  max-height: 10em;
}

.p-fileupload {
  display: inline-block;
  margin: 0;
}

</style>