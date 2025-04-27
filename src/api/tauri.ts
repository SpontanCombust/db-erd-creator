import { invoke } from '@tauri-apps/api/core'


export async function listOdbcDrivers() : Promise<string[]> {
    return await invoke<string[]>('odbc_drivers').then(drivers => drivers.sort());
}

export async function connectToDb(connString : string) : Promise<void> {
    return await invoke('db_connect', { connString });
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
