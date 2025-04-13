import { v4 as uuid } from 'uuid';

import type { DbTableColumnKeyType } from './DbTableColumnKeyType';


export default class DbTableColumn {
    public readonly id: string;
    public readonly tableId: string;
    public name: string;
    public type: string;
    public keyType: DbTableColumnKeyType;


    constructor(args: {
        id?: string,
        tableId: string,
        name?: string,
        type?: string,
        keyType?: DbTableColumnKeyType
    }) {
        this.id = args.id ?? uuid();
        this.tableId = args.tableId;
        this.name = args.name ?? "ColumnName";
        this.type = args.type ?? "Type";
        this.keyType = args.keyType ?? null;
    }
}