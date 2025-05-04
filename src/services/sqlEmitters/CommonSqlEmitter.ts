import type DbTable from "@/model/DbTable";
import type SqlEmitter from "./SqlEmitter";
import type DbTableColumn from "@/model/DbTableColumn";
import type DbTableRelation from "@/model/DbTableRelation";


export default abstract class CommonSqlEmmitter implements SqlEmitter {
    protected tables: DbTable[];
    protected columns: DbTableColumn[];
    protected relations: DbTableRelation[];

    constructor() {
        this.tables = [];
        this.columns = [];
        this.relations = [];
    }


    public setData(tables: DbTable[], columns: DbTableColumn[], relations: DbTableRelation[]) {
        this.tables = tables;
        this.columns = columns;
        this.relations = relations;
    }

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
        const columns = this.getColumnsByTableId(table.id);

        const defs = [];
        for (const col of columns) {
            defs.push(this.createTableColumnDefinition(col));
        }
        return defs;
    }

    protected createTableColumnDefinition(column: DbTableColumn) : string {
        let colSql = `  ${column.name} ${column.type}`;
        if (column.isPrimaryKey) {
            colSql += ' PRIMARY KEY';
        }
        return colSql;
    }


    protected getColumnsByTableId(id: string) : DbTableColumn[] {
        return this.columns.filter(c => c.tableId == id);
    }

    protected getRelationsByTargetTableId(id: string) : DbTableRelation[] {
        return this.relations.filter(r => r.targetTableId == id);
    }

    protected getTableById(id: string) : DbTable | undefined {
        return this.tables.find(t => t.id == id);
    }

    protected getColumnById(id: string) : DbTableColumn | undefined {
        return this.columns.find(t => t.id == id);
    }
}
