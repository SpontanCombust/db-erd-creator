import type DbTableRelationKindDto from "./DbTableRelationKindDto";

export default interface DbTableRelationDto {
    sourceTableId: string;
    sourceColumnId?: string;
    targetTableId: string;
    targetColumnId?: string;
    kind: DbTableRelationKindDto;
}