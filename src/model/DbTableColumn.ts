import { v4 as uuid } from 'uuid';


export default class DbTableColumn {
    public readonly id: string;
    public name: string;
    public type: string;
    public keyType: null | "PK" | "FK";

    constructor(
        id: string | null
    ) {
        this.id = id ?? uuid();
        this.name = "ColumnName";
        this.type = "Type";
        this.keyType = null;
    }
}