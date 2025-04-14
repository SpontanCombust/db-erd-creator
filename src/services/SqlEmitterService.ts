import type DbTable from "@/model/DbTable";
import type DbTableColumn from "@/model/DbTableColumn";
import { SupportedDbKind } from "@/model/SupportedDbKind";
import { useDbConnectionStore } from "@/stores/DbConnectionStore";
import { useDbTableColumnStore } from "@/stores/DbTableColumnStore";
import { useDbTableRelationStore } from "@/stores/DbTableRelationStore";
import { useDbTableStore } from "@/stores/DbTableStore";


export default class SqlEmitterService {
    private emitter: SqlEmitter = new SQLiteEmitter();

    public emitSql() : string[] {
        this.setupEmitter();

        const sql = [this.emitter.emitPreambleSql()];

        const { tables } = useDbTableStore();
        for (const t of tables) {
            sql.push(this.emitter.emitCreateTableSql(t));
        }

        return sql.filter(stmt => stmt.length > 0);
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
                this.emitter = new SqlServerEmitter();
                break;
            default:
                this.emitter = new SQLiteEmitter();
        }
    }
}



interface SqlEmitter {
    emitPreambleSql() : string;
    emitCreateTableSql(table: DbTable) : string;
}


abstract class CommonSqlEmmitter implements SqlEmitter {
    public emitPreambleSql(): string {
        return '';
    }

    public emitCreateTableSql(table: DbTable) : string {
        let sql = this.createTableStart(table);
        sql += this.createTableDefinitions(table).join(",\n");
        sql += this.createTableEnd(table);

        return sql;
    }


    protected createTableStart(table: DbTable) : string {
        return `CREATE TABLE "${table.name}" (\n`;
    }

    protected createTableEnd(table: DbTable) : string {
        return '\n);';   
    }

    protected createTableDefinitions(table: DbTable) : string[] {
        const { getColumnsByTableId } = useDbTableColumnStore();

        const columns = getColumnsByTableId(table.id);

        const defs = [];
        for (const col of columns) {
            defs.push(this.createTableColumnDefinition(col));
        }
        return defs;
    }

    protected createTableColumnDefinition(column: DbTableColumn) : string {
        let colSql = `  ${column.name} ${column.type}`;
        if (column.keyType == 'PK') {
            colSql += ' PRIMARY KEY';
        }
        return colSql;
    }
}


class SQLiteEmitter extends CommonSqlEmmitter {
    public override emitPreambleSql(): string {
        return "PRAGMA foreign_keys = ON;";
    }

    protected override createTableDefinitions(table: DbTable): string[] {
        const { getTableByKey } = useDbTableStore();
        const { getColumnsByTableId, getColumnByKey } = useDbTableColumnStore();
        const { getRelationsByTargetTableId } = useDbTableRelationStore();        

        const defs = super.createTableDefinitions(table);

        const columns = getColumnsByTableId(table.id);
        const relations = getRelationsByTargetTableId(table.id);

        for (const r of relations) {
            const sourceTable = getTableByKey(r.sourceTableId);
            const sourceColumn = getColumnByKey(r.sourceColumnId);
            const targetColumn = columns.find(c => c.id == r.targetColumnId);
            if (sourceTable && sourceColumn && targetColumn) {
                defs.push(`  FOREIGN KEY (${targetColumn.name}) REFERENCES "${sourceTable.name}"(${sourceColumn.name})`);
            }
        }

        return defs;
    }
}

class MySqlEmitter extends CommonSqlEmmitter {
    protected override createTableEnd(table: DbTable): string {
        return ") ENGINE=InnoDB;";
    }

    protected override createTableDefinitions(table: DbTable): string[] {
        const { getTableByKey } = useDbTableStore();
        const { getColumnsByTableId, getColumnByKey } = useDbTableColumnStore();
        const { getRelationsByTargetTableId } = useDbTableRelationStore();        

        const defs = super.createTableDefinitions(table);

        const columns = getColumnsByTableId(table.id);
        const relations = getRelationsByTargetTableId(table.id);

        for (const r of relations) {
            const sourceTable = getTableByKey(r.sourceTableId);
            const sourceColumn = getColumnByKey(r.sourceColumnId);
            const targetColumn = columns.find(c => c.id == r.targetColumnId);
            if (sourceTable && sourceColumn && targetColumn) {
                defs.push(`  FOREIGN KEY (${targetColumn.name}) REFERENCES "${sourceTable.name}"(${sourceColumn.name})`);
            }
        }

        return defs;
    }
}

class PostgreSqlEmitter extends CommonSqlEmmitter {
    protected override createTableDefinitions(table: DbTable): string[] {
        const { getTableByKey } = useDbTableStore();
        const { getColumnsByTableId, getColumnByKey } = useDbTableColumnStore();
        const { getRelationsByTargetTableId } = useDbTableRelationStore();        

        const defs = super.createTableDefinitions(table);

        const columns = getColumnsByTableId(table.id);
        const relations = getRelationsByTargetTableId(table.id);

        for (const r of relations) {
            const sourceTable = getTableByKey(r.sourceTableId);
            const sourceColumn = getColumnByKey(r.sourceColumnId);
            const targetColumn = columns.find(c => c.id == r.targetColumnId);
            if (sourceTable && sourceColumn && targetColumn) {
                defs.push(`  CONSTRAINT FK_${targetColumn.name} FOREIGN KEY (${targetColumn.name}) REFERENCES "${sourceTable.name}"(${sourceColumn.name})`);
            }
        }

        return defs;
    }
}

class SqlServerEmitter extends CommonSqlEmmitter {
    protected override createTableColumnDefinition(column: DbTableColumn): string {
        const { getTableByKey } = useDbTableStore();
        const { getColumnByKey } = useDbTableColumnStore();
        const { getRelationsByTargetTableId } = useDbTableRelationStore();

        let colSql = super.createTableColumnDefinition(column);

        const relations = getRelationsByTargetTableId(column.tableId);
        const r = relations.find(r => r.targetColumnId == column.id);
        if (r) {
            const sourceTable = getTableByKey(r.sourceTableId);
            const sourceColumn = getColumnByKey(r.sourceColumnId);

            if (sourceTable && sourceColumn) {
                colSql += ` FOREIGN KEY REFERENCES "${sourceTable.name}"(${sourceColumn.name})`;
            }
        }

        return colSql;
    }
}