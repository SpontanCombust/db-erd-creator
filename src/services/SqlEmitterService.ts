import type DbTable from "@/model/DbTable";
import { useDbTableColumnStore } from "@/stores/DbTableColumnStore";
import { useDbTableRelationStore } from "@/stores/DbTableRelationStore";
import { useDbTableStore } from "@/stores/DbTableStore";


export default class SqlEmitterService {
    public emitSql() : string {
        let sql = '';

        const { tables } = useDbTableStore();
        for (const t of tables) {
            sql += this.emitCreateTableSql(t) + '\n';
        }

        return sql;
    }

    private emitCreateTableSql(table: DbTable) : string {
        const { getTableByKey } = useDbTableStore();
        const { getColumnsByTableId, getColumnByKey } = useDbTableColumnStore();
        const { getRelationsByTargetTableId } = useDbTableRelationStore();        

        const columns = getColumnsByTableId(table.id);
        const relations = getRelationsByTargetTableId(table.id);


        let sql = `CREATE TABLE "${table.name}" (\n`;

        let columnSqls = [];
        for (const col of columns) {
            columnSqls.push(`  ${col.name} ${col.type}`);
        }
        
        const pk = columns.find(c => c.keyType == 'PK');
        if (pk) {
            columnSqls.push(`  PRIMARY KEY(${pk.name})`);
        }

        for (const r of relations) {
            const sourceTable = getTableByKey(r.sourceTableId);
            const sourceColumn = getColumnByKey(r.sourceColumnId);
            const targetColumn = columns.find(c => c.id == r.targetColumnId);
            if (sourceTable && sourceColumn && targetColumn) {
                columnSqls.push(`  CONTRAINT FK_${targetColumn.name} FOREIGN KEY(${targetColumn.name}) REFERENCES ${sourceTable.name}(${sourceColumn.name})`);
            }
        }

        sql += columnSqls.join(',\n');
        sql += '\n);';

        return sql;
    }
}