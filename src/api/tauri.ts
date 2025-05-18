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
    query = query.trim();
    console.log(query);
    const res = await invoke<string>('db_execute', { query });
    return res;
}

export interface DbQueryResult {
    columnNames: string[],
    records: string[][]
}

export async function executeDbSelectQuery(query: string) : Promise<DbQueryResult> {
    query = query.trim();
    console.log(query);
    const res = await invoke<string>('db_execute', { query });

    const resLines = res.split('\n');
    const columnNames = resLines[0].split(';');
    const records = resLines.slice(1).map(ln => ln.split(';'));

    return {
        columnNames,
        records
    };
}

export async function disconnectFromDb() : Promise<void> {
    return await invoke('db_disconnect');
}
