import type DbTable from "@/model/DbTable";
import type DbTableColumn from "@/model/DbTableColumn";
import type DbTableRelation from "@/model/DbTableRelation";
import { SupportedDbKind } from "@/model/SupportedDbKind";
import { useDbConnectionStore } from "@/stores/DbConnectionStore";
import { useDbTableColumnStore } from "@/stores/DbTableColumnStore";
import { useDbTableRelationStore } from "@/stores/DbTableRelationStore";
import { useDbTableStore } from "@/stores/DbTableStore";
import type SqlEmitter from "./sqlEmitters/SqlEmitter";
import SQLiteEmitter from "./sqlEmitters/SQLiteEmitter";
import PostgreSqlEmitter from "./sqlEmitters/PostgreSqlEmitter";
import MySqlEmitter from "./sqlEmitters/MySqlEmitter";
import MsSqlServerEmitter from "./sqlEmitters/MsSqlServerEmitter";


export default class SqlEmitterService {
    private tables: DbTable[];
    private columns: DbTableColumn[];
    private relations: DbTableRelation[];
    private emitter: SqlEmitter = new SQLiteEmitter();

    constructor() {
        this.tables = [];
        this.columns = [];
        this.relations = [];
    }


    public emitSql() : { subject: string, sql: string }[] {
        this.setupData();
        this.setupEmitter();

        const statements = [];
        
        statements.push({
            subject: 'Preamble',
            sql: this.emitter.emitPreambleSql()
        });
        
        for (const t of this.tables) {
            statements.push({
                subject: 'Table '+ t.name,
                sql: this.emitter.emitCreateTableSql(t)
            });
        }

        return statements;
    }


    private setupData() {
        const { tables } = useDbTableStore();
        const { columns } = useDbTableColumnStore();
        const { relations } = useDbTableRelationStore();

        this.tables = [...tables];
        this.columns = [...columns];
        this.relations = [...relations];

        //TODO data mutations regarding N-N relations and inheritance
    }

    private setupEmitter() {
        const { dbKind } = useDbConnectionStore();

        switch (dbKind) {
            case SupportedDbKind.SQLite:
                this.emitter = new SQLiteEmitter();
                break;
            case SupportedDbKind.PostgreSQL:
                this.emitter = new PostgreSqlEmitter();
                break;
            case SupportedDbKind.MySQL:
                this.emitter = new MySqlEmitter();
                break;
            case SupportedDbKind.SQLServer:
                this.emitter = new MsSqlServerEmitter();
                break;
            default:
                this.emitter = new SQLiteEmitter();
        }

        this.emitter.setData(this.tables, this.columns, this.relations);
    }
}
