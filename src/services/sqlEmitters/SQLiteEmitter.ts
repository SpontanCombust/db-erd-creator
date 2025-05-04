import type DbTable from "@/model/DbTable";
import CommonSqlEmmitter from "./CommonSqlEmitter";


export default class SQLiteEmitter extends CommonSqlEmmitter {
    public override emitPreambleSql(): string {
        return "PRAGMA foreign_keys = ON;";
    }

    protected override createTableDefinitions(table: DbTable): string[] {
        const defs = super.createTableDefinitions(table);

        const tableColumns = this.getColumnsByTableId(table.id);
        const tableRelations = this.getRelationsByTargetTableId(table.id);

        for (const r of tableRelations) {
            if (r.sourceColumnId) {
                const sourceTable = this.getTableById(r.sourceTableId);
                const sourceColumn = this.getColumnById(r.sourceColumnId);
                const targetColumn = tableColumns.find(c => c.id == r.targetColumnId);
                if (sourceTable && sourceColumn && targetColumn) {
                    defs.push(`  FOREIGN KEY (${targetColumn.name}) REFERENCES "${sourceTable.name}"(${sourceColumn.name})`);
                }
            }
        }

        return defs;
    }
}
