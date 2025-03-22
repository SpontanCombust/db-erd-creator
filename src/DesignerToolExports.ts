import type DbTable from "./model/DbTable";


export default interface DesignerToolExports {
    designerClick?(ev: MouseEvent) : any;
    tableMouseDown?(ev: MouseEvent, table: DbTable) : any;
    tableMouseUp?(ev: MouseEvent, table: DbTable) : any;
    tableClick?(ev: MouseEvent, table: DbTable) : any;
}