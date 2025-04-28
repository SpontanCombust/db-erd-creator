import type { DbTableColumnKeyTypeDto } from "./DbTableColumnKeyTypeDto";

export default interface DbTableColumnDto {
    id: string;
    tableId: string;
    name: string;
    type: string;
    keyType: DbTableColumnKeyTypeDto;
}