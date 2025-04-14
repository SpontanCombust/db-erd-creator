import { SupportedDbKind } from "@/model/SupportedDbKind";

import { defineStore } from "pinia";
import { ref } from "vue";


export const useDbConnectionStore = defineStore('DbConnectionStore', () => {
    const driver = ref('');
    const dbKind = ref(SupportedDbKind.SQLite);
    const dbName = ref('');

    function storeConnection(driv: string, kind: SupportedDbKind, name: string) {
        driver.value = driv;
        dbKind.value = kind;
        dbName.value = name;
    }

    return {
        driver,
        dbKind,
        dbName,
        storeConnection
    }
});