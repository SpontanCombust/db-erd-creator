import { invoke } from '@tauri-apps/api/core'


export async function listOdbcDrivers() : Promise<string[]> {
    return await invoke('odbc_drivers');
}

export async function connectToSqliteDb(driver: string, dbPath: string) : Promise<void> {
    return await invoke('db_connect_sqlite', { driver, dbPath });
}

export async function isConnectedToDb() : Promise<boolean> {
    return await invoke('db_connected');
}

export async function executeDbQuery(query: string) : Promise<string> {
    return await invoke('db_execute', { query });
}
