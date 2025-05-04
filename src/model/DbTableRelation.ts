import type DbTableRelationKind from "./DbTableRelationKind";


export default class DbTableRelation {
    public readonly sourceTableId: string;
    public readonly sourceColumnId?: string;
    public readonly targetTableId: string;
    public readonly targetColumnId?: string;
    public readonly kind: DbTableRelationKind;


    constructor(args: {
        sourceTableId: string,
        sourceColumnId?: string,
        targetTableId: string,
        targetColumnId?: string,
        kind: DbTableRelationKind
    }) {
        this.sourceTableId = args.sourceTableId;
        this.sourceColumnId = args.sourceColumnId;
        this.targetTableId = args.targetTableId;
        this.targetColumnId = args.targetColumnId;
        this.kind = args.kind;
    }
}