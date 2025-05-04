import type DbTableColumn from "@/model/DbTableColumn";
import CommonSqlEmmitter from "./CommonSqlEmitter";


export default class MsSqlServerEmitter extends CommonSqlEmmitter {
    protected override createTableColumnDefinition(column: DbTableColumn): string {
        let colSql = super.createTableColumnDefinition(column);

        const tableRelations = this.getRelationsByTargetTableId(column.tableId);
        const r = tableRelations.find(r => r.targetColumnId == column.id);
        if (r && r.sourceColumnId) {
            const sourceTable = this.getTableById(r.sourceTableId);
            const sourceColumn = this.getColumnById(r.sourceColumnId);

            if (sourceTable && sourceColumn) {
                colSql += ` FOREIGN KEY REFERENCES "${sourceTable.name}"(${sourceColumn.name})`;
            }
        }

        return colSql;
    }
}