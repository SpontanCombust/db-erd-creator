import DbTable from "@/model/DbTable";

import { defineStore } from "pinia";
import { ref } from "vue";


export const useDbTableStore = defineStore('DbTable', () => {
    const tables = ref<DbTable[]>([]);

    function addTable(table: DbTable) {
        tables.value.push(table);
    }

    function getTableByKey(id: string) : DbTable | undefined {
        return tables.value.find(t => t.id == id);
    }

    function updateTable(table: DbTable) {
        const ti = tables.value.findIndex(t => t.id == table.id);
        if (ti != -1) {
            tables.value[ti] = table;
        }
    }

    function removeTable(id: string) {
        const ti = tables.value.findIndex(t => t.id == id);
        if (ti != -1) {
            tables.value.splice(ti, 1);
        }
    }

    function clearTables() {
        tables.value = [];
    }

    return { 
        tables, 
        addTable, 
        getTableByKey, 
        updateTable, 
        removeTable,
        clearTables
    };
});
