import type DbTableColumnDto from "./DbTableColumnDto";
import type DbTableDto from "./DbTableDto";
import type DbTableRelationDto from "./DbTableRelationDto";


export default interface DbDesignDto {
    tables: DbTableDto[],
    columns: DbTableColumnDto[],
    relations: DbTableRelationDto[]
}