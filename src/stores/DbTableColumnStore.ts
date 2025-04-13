import DbTableColumn from "@/model/DbTableColumn";

import { defineStore } from "pinia";
import { ref } from "vue";


export const useDbTableColumnStore = defineStore('DbTableColumn', () => {
    const columns = ref<DbTableColumn[]>([]);

    function addColumn(column: DbTableColumn) {
        columns.value.push(column);
    }

    function getColumnByKey(id: string) : DbTableColumn | undefined {
        return columns.value.find(c => c.id == id);
    }

    function getColumnsByTableId(tableId: string) : DbTableColumn[] {
        return columns.value.filter(c => c.tableId == tableId);
    }

    function updateColumn(column: DbTableColumn) {
        const ci = columns.value.findIndex(c => c.id == column.id);
        if (ci != -1) {
            columns.value[ci] = column;
        }
    }

    function removeColumn(id: string) {
        const ci = columns.value.findIndex(c => c.id == id);
        if (ci != -1) {
            columns.value.splice(ci, 1);
        }
    }

    return { 
        columns, 
        addColumn, 
        getColumnByKey, 
        getColumnsByTableId, 
        updateColumn, 
        removeColumn 
    };
});
