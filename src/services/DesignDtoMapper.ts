import { NIL } from "uuid";

import type DbDesignDto from "@/dto/DbDesignDto";
import type DbTableColumnDto from "@/dto/DbTableColumnDto";
import type DbTableDto from "@/dto/DbTableDto";
import DbTableInheritanceKindDto from "@/dto/DbTableInheritanceKindDto";
import type DbTableRelationDto from "@/dto/DbTableRelationDto";
import DbTableRelationKindDto from "@/dto/DbTableRelationKindDto";
import type DbDesign from "@/model/DbDesign";
import DbTable from "@/model/DbTable";
import DbTableColumn from "@/model/DbTableColumn";
import DbTableInheritanceKind from "@/model/DbTableInheritanceKind";
import DbTableRelation from "@/model/DbTableRelation";
import DbTableRelationKind from "@/model/DbTableRelationKind";


export default class DesignDtoMapper {
    public mapDesignModelToDto(model: DbDesign) : DbDesignDto {
        return {
            tables: model.tables.map(t => this.tableModelToDto(t)),
            columns: model.columns.map(c => this.columnModelToDto(c)),
            relations: model.relations.map(r => this.relationModelToDto(r)),
            tableInheritanceKind: this.tableInheritanceKindModelToDto(model.tableInheritanceKind)
        };
    }

    public mapDesignDtoToModel(dto: DbDesignDto) : DbDesign {
        return {
            tables: dto.tables ? dto.tables.map(t => this.tableDtoToModel(t)) : [],
            columns: dto.columns ? dto.columns.map(c => this.columnDtoToModel(c)) : [],
            relations: dto.relations ? dto.relations.map(r => this.relationDtoToModel(r)) : [],
            tableInheritanceKind: dto.tableInheritanceKind ? this.tableInheritanceKindDtoToModel(dto.tableInheritanceKind) : DbTableInheritanceKind.SingleTable
        }
    }


    private tableModelToDto(model: DbTable) : DbTableDto {
        return {
            id: model.id,
            name: model.name,
            posX: model.posX,
            posY: model.posY,
            isAbstract: model.isAbstract
        };
    }

    private tableDtoToModel(dto: DbTableDto) : DbTable {
        return new DbTable({
            id: dto.id ?? NIL,
            name: dto.name,
            posX: dto.posX,
            posY: dto.posY,
            isAbstract: dto.isAbstract
        });
    }


    private columnModelToDto(model: DbTableColumn) : DbTableColumnDto {
        return {
            id: model.id,
            tableId: model.tableId,
            name: model.name,
            type: model.type,
            isPrimaryKey: model.isPrimaryKey,
            isForeignKey: model.isForeignKey,
            isNullable: model.isNullable,
            isUnique: model.isUnique,
            defaultValue: model.defaultValue
        }
    }

    private columnDtoToModel(dto: DbTableColumnDto) : DbTableColumn {
        return new DbTableColumn({
            id: dto.id ?? NIL,
            tableId: dto.tableId ?? NIL,
            name: dto.name,
            type: dto.type,
            isPrimaryKey: dto.isPrimaryKey,
            isForeignKey: dto.isForeignKey,
            isNullable: dto.isNullable,
            isUnique: dto.isUnique,
            defaultValue: dto.defaultValue
        });
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
            sourceTableId: dto.sourceTableId ?? NIL,
            sourceColumnId: dto.sourceColumnId,
            targetTableId: dto.targetTableId ?? NIL,
            targetColumnId: dto.targetColumnId,
            kind: dto.kind ? this.relationKindDtoToModel(dto.kind) : DbTableRelationKind.OneToOne
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
            default: return DbTableRelationKind.OneToOne;
        }
    }


    private tableInheritanceKindModelToDto(model: DbTableInheritanceKind) : DbTableInheritanceKindDto {
        switch (model) {
            case DbTableInheritanceKind.SingleTable: return DbTableInheritanceKindDto.SingleTable;
            case DbTableInheritanceKind.ClassTable: return DbTableInheritanceKindDto.ClassTable;
            case DbTableInheritanceKind.ConcreteTable: return DbTableInheritanceKindDto.ConcreteTable;
        }
    }

    private tableInheritanceKindDtoToModel(dto: DbTableInheritanceKindDto) : DbTableInheritanceKind {
        switch (dto) {
            case DbTableInheritanceKindDto.SingleTable: return DbTableInheritanceKind.SingleTable;
            case DbTableInheritanceKindDto.ClassTable: return DbTableInheritanceKind.ClassTable;
            case DbTableInheritanceKindDto.ConcreteTable: return DbTableInheritanceKind.ConcreteTable;
            default: return DbTableInheritanceKind.SingleTable;
        }
    }
}