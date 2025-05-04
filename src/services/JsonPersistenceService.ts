import { useDbTableStore } from "@/stores/DbTableStore";
import type DesignSerializerService from "./DesignSerializerService";
import { useDbTableColumnStore } from "@/stores/DbTableColumnStore";
import { useDbTableRelationStore } from "@/stores/DbTableRelationStore";
import type DbDesign from "@/model/DbDesign";
import { useDesignerStateStore } from "@/stores/DesignerStateStore";

export default class JsonPersistenceService {
    private serializerService: DesignSerializerService;

    constructor(serializerService: DesignSerializerService) {
        this.serializerService = serializerService;
    }


    saveCurrentDesignToJson() : string {
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

        return this.serializerService.serializeDesignToJson(design);
    }

    loadDesignFromJson(json: string) {
        const { clearTables, addTable } = useDbTableStore();
        const { clearColumns, addColumn } = useDbTableColumnStore();
        const { clearRelations, addRelation } = useDbTableRelationStore();
        const { setSelectedTableInheritanceKind } = useDesignerStateStore();

        clearTables();
        clearColumns();
        clearRelations();

        const design = this.serializerService.deserializeDesignFromJson(json);
        
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