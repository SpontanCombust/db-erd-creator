import type DbTable from "./DbTable";
import type DbTableRelation from "./DbTableRelation";
import DesignerToolMode from "./DesignerToolMode";


export default class DesignerState {
    public clientX: number;
    public clientY: number;
    public toolMode: DesignerToolMode;

    public tables: DbTable[];
    public relations: DbTableRelation[];

    constructor() {
        this.clientX = 0;
        this.clientY = 0;
        this.toolMode = DesignerToolMode.Move;
        this.tables = [];
        this.relations = [];
    }
}