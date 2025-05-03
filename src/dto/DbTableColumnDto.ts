export default interface DbTableColumnDto {
    id: string;
    tableId: string;
    name: string;
    type: string;
    isPrimaryKey: boolean;
    isForeignKey: boolean;
    isNullable: boolean;
    isUnique: boolean;
    defaultValue?: string;
}