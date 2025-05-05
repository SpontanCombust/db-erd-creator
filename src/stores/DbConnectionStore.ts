import { SupportedDbKind } from "@/model/SupportedDbKind";

import { defineStore } from "pinia";
import { ref } from "vue";


const DRIVER_STORAGE_KEY = 'dbConn/driver';
const DB_KIND_STORAGE_KEY = 'dbConn/dbKind';
const DB_NAME_STORAGE_KEY = 'dbConn/dbName';
const DB_CONN_STRING_STORAGE_KEY = 'dbConn/connString';

export const useDbConnectionStore = defineStore('DbConnectionStore', () => {
    const sessionDriver = sessionStorage.getItem(DRIVER_STORAGE_KEY);
    const sessionDbKind = sessionStorage.getItem(DB_KIND_STORAGE_KEY);
    const sessionDbName = sessionStorage.getItem(DB_NAME_STORAGE_KEY);
    const sessionDbConnString = sessionStorage.getItem(DB_CONN_STRING_STORAGE_KEY);

    const connected = ref(sessionDbConnString != null);
    const driver = ref(sessionDriver ?? '');
    const dbKind = ref(sessionDbKind ? Number.parseInt(sessionDbKind) : SupportedDbKind.SQLite);
    const dbName = ref(sessionDbName ?? '');
    const connectionString = ref(sessionDbConnString ?? '');

    function storeConnection(driv: string, kind: SupportedDbKind, name: string, connString: string) {
        connected.value = true;
        driver.value = driv;
        dbKind.value = kind;
        dbName.value = name;
        connectionString.value = connString;

        sessionStorage.setItem(DRIVER_STORAGE_KEY, driv);
        sessionStorage.setItem(DB_KIND_STORAGE_KEY, kind.toString());
        sessionStorage.setItem(DB_NAME_STORAGE_KEY, name);
        sessionStorage.setItem(DB_CONN_STRING_STORAGE_KEY, connString);
    }

    function releaseConnection() {
        connected.value = false;
        driver.value = '';
        dbKind.value = 0;
        dbName.value = '';

        sessionStorage.removeItem(DRIVER_STORAGE_KEY);
        sessionStorage.removeItem(DB_KIND_STORAGE_KEY);
        sessionStorage.removeItem(DB_NAME_STORAGE_KEY);
        sessionStorage.removeItem(DB_CONN_STRING_STORAGE_KEY);
    }

    return {
        connected,
        driver,
        dbKind,
        dbName,
        connectionString,
        storeConnection,
        releaseConnection
    }
});