import type DbTable from "@/model/DbTable";
import type DbTableColumn from "@/model/DbTableColumn";
import type DbTableRelation from "@/model/DbTableRelation";


export default interface SqlEmitter {
    setData(
        tables: DbTable[], 
        columns: DbTableColumn[], 
        relations: DbTableRelation[]
    ) : void;
    emitPreambleSql() : string;
    emitCreateTableSql(table: DbTable) : string;
}