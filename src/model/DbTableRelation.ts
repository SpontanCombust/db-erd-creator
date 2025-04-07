import type DbTable from "./DbTable";
import type DbTableColumn from "./DbTableColumn";
import type DbTableRelationKind from "./DbTableRelationKind";


export default class DbTableRelation {
    public readonly connectedFromTable: DbTable;
    public readonly connectedFromColumn: DbTableColumn;
    public readonly connectedToTable: DbTable;
    public readonly connectedToColumn: DbTableColumn;
    public readonly kind: DbTableRelationKind;

    constructor(
        connectedFromTable: DbTable,
        connectedFromColumn: DbTableColumn,
        connectedToTable: DbTable,
        connectedToColumn: DbTableColumn,
        kind: DbTableRelationKind
    ) {
        this.connectedFromTable = connectedFromTable;
        this.connectedFromColumn = connectedFromColumn;
        this.connectedToTable = connectedToTable;
        this.connectedToColumn = connectedToColumn;
        this.kind = kind;
    }

    public calculateOrientation() : { x1: number, y1: number, x2: number, y2: number } {
        //TODO proper sticking to table edges
        return {
            x1: this.connectedFromTable.designerPosition.x,
            y1: this.connectedFromTable.designerPosition.y,
            x2: this.connectedToTable.designerPosition.x,
            y2: this.connectedToTable.designerPosition.y,
        }
    }
}