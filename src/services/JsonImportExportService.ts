import { useDbTableStore } from "@/stores/DbTableStore";
import type DesignDtoMapper from "./DesignDtoMapper";
import { useDbTableColumnStore } from "@/stores/DbTableColumnStore";
import { useDbTableRelationStore } from "@/stores/DbTableRelationStore";
import type DbDesign from "@/model/DbDesign";
import { useDesignerStateStore } from "@/stores/DesignerStateStore";
import type DbDesignDto from "@/dto/DbDesignDto";

export default class JsonImportExportService {
    private dtoMapper: DesignDtoMapper;

    constructor(dtoMapper: DesignDtoMapper) {
        this.dtoMapper = dtoMapper;
    }


    exportCurrentDesignToJson() : string {
        const { tables } = useDbTableStore();
        const { columns } = useDbTableColumnStore();
        const { relations } = useDbTableRelationStore();
        const { selectedTableInheritanceKind } = useDesignerStateStore();

        const design: DbDesign = {
            tables: [...tables],
            columns: [...columns],
            relations: [...relations],
            tableInheritanceKind: selectedTableInheritanceKind
        };
        const designDto = this.dtoMapper.mapDesignModelToDto(design);
        const json = JSON.stringify(designDto);

        return json;
    }

    importDesignFromJson(json: string) {
        const { clearTables, addTable } = useDbTableStore();
        const { clearColumns, addColumn } = useDbTableColumnStore();
        const { clearRelations, addRelation } = useDbTableRelationStore();
        const { setSelectedTableInheritanceKind } = useDesignerStateStore();

        clearTables();
        clearColumns();
        clearRelations();

        const designDto: DbDesignDto = JSON.parse(json);
        const design = this.dtoMapper.mapDesignDtoToModel(designDto);
        
        for (const t of design.tables) {
            addTable(t);
        }
        for (const c of design.columns) {
            addColumn(c);
        }
        for (const r of design.relations) {
            addRelation(r);
        }

        setSelectedTableInheritanceKind(design.tableInheritanceKind);
    } 
}