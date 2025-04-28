import type DbDesignDto from "@/dto/DbDesignDto";
import type DbTableColumnDto from "@/dto/DbTableColumnDto";
import type { DbTableColumnKeyTypeDto } from "@/dto/DbTableColumnKeyTypeDto";
import type DbTableDto from "@/dto/DbTableDto";
import type DbTableRelationDto from "@/dto/DbTableRelationDto";
import DbTableRelationKindDto from "@/dto/DbTableRelationKindDto";
import type DbDesign from "@/model/DbDesign";
import DbTable from "@/model/DbTable";
import DbTableColumn from "@/model/DbTableColumn";
import type { DbTableColumnKeyType } from "@/model/DbTableColumnKeyType";
import DbTableRelation from "@/model/DbTableRelation";
import DbTableRelationKind from "@/model/DbTableRelationKind";


export default class DesignSerializerService {
    serializeDesignToJson(design: DbDesign) : string {
        const designDto: DbDesignDto = {
            tables: design.tables.map(t => this.tableModelToDto(t)),
            columns: design.columns.map(c => this.columnModelToDto(c)),
            relations: design.relations.map(r => this.relationModelToDto(r))
        };

        return JSON.stringify(designDto);
    }

    deserializeDesignFromJson(json: string) : DbDesign {
        const designDto: DbDesignDto = JSON.parse(json);

        return {
            tables: designDto.tables.map(t => this.tableDtoToModel(t)),
            columns: designDto.columns.map(c => this.columnDtoToModel(c)),
            relations: designDto.relations.map(r => this.relationDtoToModel(r))
        }
    }


    private tableModelToDto(model: DbTable) : DbTableDto {
        return {
            id: model.id,
            name: model.name,
            posX: model.posX,
            posY: model.posY
        };
    }

    private tableDtoToModel(dto: DbTableDto) : DbTable {
        return new DbTable({
            id: dto.id,
            name: dto.name,
            posX: dto.posX,
            posY: dto.posY
        });
    }


    private columnModelToDto(model: DbTableColumn) : DbTableColumnDto {
        return {
            id: model.id,
            tableId: model.tableId,
            name: model.name,
            type: model.type,
            keyType: this.columnKeyTypeModelToDto(model.keyType)
        }
    }

    private columnDtoToModel(dto: DbTableColumnDto) : DbTableColumn {
        return new DbTableColumn({
            id: dto.id,
            tableId: dto.tableId,
            name: dto.name,
            type: dto.type,
            keyType: this.columnKeyTypeDtoToModel(dto.keyType)
        });
    }


    private columnKeyTypeModelToDto(model: DbTableColumnKeyType) : DbTableColumnKeyTypeDto {
        // same form
        return model;
    }

    private columnKeyTypeDtoToModel(dto: DbTableColumnKeyTypeDto) : DbTableColumnKeyType {
        // same form
        return dto;
    }


    private relationModelToDto(model: DbTableRelation) : DbTableRelationDto {
        return {
            sourceTableId: model.sourceTableId,
            sourceColumnId: model.sourceColumnId,
            targetTableId: model.targetTableId,
            targetColumnId: model.targetColumnId,
            kind: this.relationKindModelToDto(model.kind)
        }
    }

    private relationDtoToModel(dto: DbTableRelationDto) : DbTableRelation {
        return new DbTableRelation({
            sourceTableId: dto.sourceTableId,
            sourceColumnId: dto.sourceColumnId,
            targetTableId: dto.targetTableId,
            targetColumnId: dto.targetColumnId,
            kind: this.relationKindDtoToModel(dto.kind)
        });
    }


    private relationKindModelToDto(model: DbTableRelationKind) : DbTableRelationKindDto {
        switch (model) {
            case DbTableRelationKind.OneToOne: return DbTableRelationKindDto.OneToOne;
            case DbTableRelationKind.OneToMany: return DbTableRelationKindDto.OneToMany;
            case DbTableRelationKind.ManyToMany: return DbTableRelationKindDto.ManyToMany;
            case DbTableRelationKind.InheritsFrom: return DbTableRelationKindDto.InheritsFrom;
        }
    }

    private relationKindDtoToModel(dto: DbTableRelationKindDto) : DbTableRelationKind {
        switch (dto) {
            case DbTableRelationKindDto.OneToOne: return DbTableRelationKind.OneToOne;
            case DbTableRelationKindDto.OneToMany: return DbTableRelationKind.OneToMany;
            case DbTableRelationKindDto.ManyToMany: return DbTableRelationKind.ManyToMany;
            case DbTableRelationKindDto.InheritsFrom: return DbTableRelationKind.InheritsFrom;
        }
    }
}