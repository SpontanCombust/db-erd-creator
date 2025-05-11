import DbTableRelation from "@/model/DbTableRelation";

import { defineStore } from "pinia";
import { ref } from "vue";


export const useDbTableRelationStore = defineStore('DbTableRelation', () => {
    const relations = ref<DbTableRelation[]>([]);

    function addRelation(relation: DbTableRelation) {
        relations.value.push(relation);
    }

    function getColumnRelationByKey(sourceColumnId: string, targetColumnId: string) : DbTableRelation | undefined {
        return relations.value.find(r => r.sourceColumnId == sourceColumnId && r.targetColumnId == targetColumnId);
    }

    function getRelationsBySourceTableId(sourceTableId: string) : DbTableRelation[] {
        return relations.value.filter(r => r.sourceTableId == sourceTableId);
    }

    function getRelationsByTargetTableId(targetTableId: string) : DbTableRelation[] {
        return relations.value.filter(r => r.targetTableId == targetTableId);
    }

    function updateRelation(relation: DbTableRelation) {
        const ri = relations.value.findIndex(r => r.sourceColumnId == relation.sourceColumnId && r.targetColumnId == relation.targetColumnId);
        if (ri != -1) {
            relations.value[ri] = relation;
        }
    }

    function removeColumnRelationByKey(sourceColumnId: string, targetColumnId: string) {
        const ri = relations.value.findIndex(r => r.sourceColumnId == sourceColumnId && r.targetColumnId == targetColumnId);
        if (ri != -1) {
            relations.value.splice(ri, 1);
        }
    }

    function removeTableRelationByKey(sourceTableId: string, targetTableId: string) {
        const ri = relations.value.findIndex(r => 
            r.sourceTableId == sourceTableId && 
            r.sourceColumnId == undefined && 
            r.targetTableId == targetTableId &&
            r.targetColumnId == undefined);

        if (ri != -1) {
            relations.value.splice(ri, 1);
        }
    }

    function clearRelations() {
        relations.value = [];
    }

    return { 
        relations, 
        addRelation, 
        getColumnRelationByKey, 
        getRelationsBySourceTableId,
        getRelationsByTargetTableId,
        updateRelation, 
        removeColumnRelationByKey,
        removeTableRelationByKey,
        clearRelations
    };
});
