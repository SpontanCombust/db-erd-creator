import { v4 as uuid } from 'uuid';

export default class DbTableColumn {
    public readonly id: string;
    public readonly tableId: string;
    public name: string;
    public type: string;
    public isPrimaryKey: boolean;
    public isForeignKey: boolean;
    public isNullable: boolean;
    public isUnique: boolean;
    public defaultValue?: string;

    constructor(args: {
        id?: string,
        tableId: string,
        name?: string,
        type?: string,
        isPrimaryKey?: boolean,
        isForeignKey?: boolean,
        isNullable?: boolean,
        isUnique?: boolean,
        defaultValue?: string
    }) {
        this.id = args.id ?? uuid();
        this.tableId = args.tableId;
        this.name = args.name ?? "ColumnName";
        this.type = args.type ?? "Type";
        this.isPrimaryKey = args.isPrimaryKey ?? false;
        this.isForeignKey = args.isForeignKey ?? false;
        this.isNullable = args.isNullable ?? true;
        this.isUnique = args.isUnique ?? false;
        this.defaultValue = args.defaultValue;
    }
}