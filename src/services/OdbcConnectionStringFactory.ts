export default class OdbcConnectionStringFactory {
    sqlite(driver: string, dbPath: string) : string {
        return `Driver={${driver}};Database=${dbPath};`;
    }

    postgresql(driver: string, server: string, port: number, database: string, uid: string, pwd: string) : string {
        return `Driver={${driver}};Server=${server};Port=${port};Database=${database};Uid=${uid};Pwd=${pwd};`;
    }

    mysql(driver: string, server: string, port: number, database: string, user: string, password: string) : string {
        return `Driver={${driver}};Server=${server};Port=${port};Database=${database};User=${user};Password=${password};`;
    }

    sqlserver(driver: string, server: string, port: number, database: string, uid: string, pwd: string) : string {
        return `Driver={${driver}};Server=${server};Port=${port};Database=${database};UID=${uid};PWD=${pwd};`/*Trusted_Connection=yes;*/;
    }
}