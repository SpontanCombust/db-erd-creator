import type DbTable from "./DbTable";
import type DbTableRelationKind from "./DbTableRelationKind";


export default class DbTableRelation {
    public readonly connectedFrom: DbTable;
    public readonly connectedTo: DbTable;
    public readonly kind: DbTableRelationKind;

    constructor(
        connectedFrom: DbTable,
        connectedTo: DbTable,
        kind: DbTableRelationKind
    ) {
        this.connectedFrom = connectedFrom;
        this.connectedTo = connectedTo;
        this.kind = kind;
    }

    public calculateOrientation() : { x1: number, y1: number, x2: number, y2: number } {
        //TODO proper sticking to table edges
        return {
            x1: this.connectedFrom.designerPosition.x,
            y1: this.connectedFrom.designerPosition.y,
            x2: this.connectedTo.designerPosition.x,
            y2: this.connectedTo.designerPosition.y,
        }
    }
}