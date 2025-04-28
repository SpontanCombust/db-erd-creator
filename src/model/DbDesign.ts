import type DbTable from "./DbTable";
import type DbTableColumn from "./DbTableColumn";
import type DbTableRelation from "./DbTableRelation";


export default interface DbDesign {
    tables: DbTable[],
    columns: DbTableColumn[],
    relations: DbTableRelation[]
}