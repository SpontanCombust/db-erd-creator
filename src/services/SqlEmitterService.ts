import type DbTable from "@/model/DbTable";
import type DbTableRelation from "@/model/DbTableRelation";

export default class SqlEmitterService {
    public emitSql(tables: DbTable[], relations: DbTableRelation[]) : string {
        let sql = '';

        for (const t of tables) {
            sql += this.emitCreateTableSql(t, relations) + '\n';
        }

        return sql;
    }

    private emitCreateTableSql(table: DbTable, relations: DbTableRelation[]) : string {
        let sql = `CREATE TABLE "${table.name}" (\n`;

        let columnSqls = [];
        for (const col of table.columns) {
            columnSqls.push(`  ${col.name} ${col.type}`);
        }
        
        const pk = table.columns.find(c => c.keyType == 'PK');
        if (pk) {
            columnSqls.push(`  PRIMARY KEY(${pk.name})`);
        }

        const fkRels = relations.filter(r => r.connectedToTable.id == table.id);
        for (const r of fkRels) {
            columnSqls.push(`  CONTRAINT FK_${r.connectedToColumn.name} FOREIGN KEY(${r.connectedToColumn.name}) REFERENCES ${r.connectedFromTable.name}(${r.connectedFromColumn.name})`);
        }

        sql += columnSqls.join(',\n');
        sql += '\n);';

        return sql;
    }
}