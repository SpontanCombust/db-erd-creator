import DbTableRelationKind from "@/model/DbTableRelationKind";
import { useDbTableColumnStore } from "@/stores/DbTableColumnStore";
import { useDbTableRelationStore } from "@/stores/DbTableRelationStore";
import { useDbTableStore } from "@/stores/DbTableStore";

export default class DesignManagerService {
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