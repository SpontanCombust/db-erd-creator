import { useDbConnectionStore } from "@/stores/DbConnectionStore";
import type DbDataTypeTemplateProvider from "./dbDataTypeProviders/DbDataTypeTemplateProvider";
import SQLiteDataTypeTemplateProvider from "./dbDataTypeProviders/SQLiteDataTypeTemplateProvider";
import { SupportedDbKind } from "@/model/SupportedDbKind";
import DbDataType from "@/model/DbDataType";
import PostgreSQLDataTypeTemplateProvider from "./dbDataTypeProviders/PostgreSQLDataTypeTemplateProvider";
import MsSqlServerDataTypeTemplateProvider from "./dbDataTypeProviders/MsSqlServerDataTypeTemplateProvider";
import MySqlDataTypeTemplateProvider from "./dbDataTypeProviders/MySqlDataTypeTemplateProvider";


export default class DbDataTypeTemplateProviderService {
    private provider: DbDataTypeTemplateProvider;

    constructor() {
        this.provider = new SQLiteDataTypeTemplateProvider();
    }


    public *availableDataTypeTemplates() : Iterable<DbDataType> {
        this.setupProvider();

        const signatures = this.provider.availableDataTypeTemplates().sort();
        for (const sign of signatures) {
            yield DbDataType.parse(sign);
        }
    }


    private setupProvider() {
        const { dbKind } = useDbConnectionStore();

        switch (dbKind) {
            case SupportedDbKind.SQLite:
                this.provider = new SQLiteDataTypeTemplateProvider();
                break;
            case SupportedDbKind.PostgreSQL:
                this.provider = new PostgreSQLDataTypeTemplateProvider();
                break;
            case SupportedDbKind.MySQL:
                this.provider = new MySqlDataTypeTemplateProvider();
                break;
            case SupportedDbKind.SQLServer:
                this.provider = new MsSqlServerDataTypeTemplateProvider();
                break;
            default:
                this.provider = new SQLiteDataTypeTemplateProvider();
        }
    }
}
