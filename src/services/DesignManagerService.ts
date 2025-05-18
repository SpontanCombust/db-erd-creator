import type DbDesign from "@/model/DbDesign";
import DbTableRelationKind from "@/model/DbTableRelationKind";
import { useDbTableColumnStore } from "@/stores/DbTableColumnStore";
import { useDbTableRelationStore } from "@/stores/DbTableRelationStore";
import { useDbTableStore } from "@/stores/DbTableStore";
import { useDesignerStateStore } from "@/stores/DesignerStateStore";


export default class DesignManagerService {
    public assembleCurrentDesign() : DbDesign {
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

        return design;
    }

    public loadDesign(design: DbDesign) {
        const { clearTables, addTable } = useDbTableStore();
        const { clearColumns, addColumn } = useDbTableColumnStore();
        const { clearRelations, addRelation } = useDbTableRelationStore();
        const { setSelectedTableInheritanceKind } = useDesignerStateStore();

        clearTables();
        clearColumns();
        clearRelations();

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


    public isNewTableConnectionValid(sourceTableId: string, targetTableId: string) : boolean {
        if (sourceTableId == targetTableId) {
            return false;
        }

        const { getTableByKey } = useDbTableStore();
        const { getRelationsBySourceTableId } = useDbTableRelationStore();


        const sourceTable = getTableByKey(sourceTableId);
        const targetTable = getTableByKey(targetTableId);

        if (!sourceTable || !targetTable) {
            console.warn('Source or target table not known');
            return false;
        }


        const sourceAlreadyInherits = getRelationsBySourceTableId(sourceTableId)
            .filter(r => r.kind == DbTableRelationKind.InheritsFrom)
            .length > 0;

        if (sourceAlreadyInherits) {
            console.warn('Mutliple inheritance is not allowed');
            return false;
        }


        let currentParentTableId: string | undefined = targetTableId;
        while(currentParentTableId) {
            if (currentParentTableId == sourceTableId) {
                console.warn('Inheritance loop detected!');
                return false;
            }

            currentParentTableId = getRelationsBySourceTableId(currentParentTableId)
                .filter(r => r.kind == DbTableRelationKind.InheritsFrom)
                .map(r => r.targetTableId)
                .at(0);
        }

        return true;
    }

    public isNewColumnConnectionValid(sourceTableId: string, sourceColumnId: string, targetTableId: string, targetColumnId: string, relKind: DbTableRelationKind) : boolean {
        if (sourceTableId == targetTableId || sourceColumnId == targetColumnId) {
            return false;
        }

        const { getColumnByKey } = useDbTableColumnStore();

        const sourceColumn = getColumnByKey(sourceColumnId);
        const targetColumn = getColumnByKey(targetColumnId);

        if (!sourceColumn || !targetColumn) {
            console.warn('Either of columns is not known');
            return false;
        }
        if (!sourceColumn.isPrimaryKey) {
            console.warn('Connection must originate from a primary key column!');
            return false;
        }
        if (!targetColumn.isForeignKey && !targetColumn.isPrimaryKey) {
            console.warn('Target table must be either a primary or foreign key!');
            return false;
        }
        if (relKind == DbTableRelationKind.InheritsFrom) {
            console.warn('Inheritance relationship is invalid in this context!');
            return false;
        }

        return true;
    }
}