import { invoke } from '@tauri-apps/api/core'


export async function listOdbcDrivers() : Promise<string[]> {
    return await invoke<string[]>('odbc_drivers').then(drivers => drivers.sort());
}

export async function connectToSqliteDb(driver: string, dbPath: string) : Promise<void> {
    return await invoke('db_connect_sqlite', { driver, dbPath });
}

export async function connectToPostgreSqlDb(driver: string, server: string, port: number, database: string, uid: string, pwd: string) : Promise<void> {
    return await invoke('db_connect_postgresql', { driver, server, port, database, uid, pwd });
}

export async function isConnectedToDb() : Promise<boolean> {
    return await invoke('db_connected');
}

export async function executeDbQuery(query: string) : Promise<string> {
    return await invoke('db_execute', { query });
}

export async function disconnectFromDb() : Promise<void> {
    return await invoke('db_disconnect');
}
