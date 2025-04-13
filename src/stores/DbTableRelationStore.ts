import DbTableRelation from "@/model/DbTableRelation";

import { defineStore } from "pinia";
import { ref } from "vue";


export const useDbTableRelationStore = defineStore('DbTableRelation', () => {
    const relations = ref<DbTableRelation[]>([]);

    function addRelation(relation: DbTableRelation) {
        relations.value.push(relation);
    }

    function getRelationByKey(sourceColumnId: string, targetColumnId: string) : DbTableRelation | undefined {
        return relations.value.find(r => r.sourceColumnId == sourceColumnId && r.targetColumnId == targetColumnId);
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

    function removeRelation(sourceColumnId: string, targetColumnId: string) {
        const ri = relations.value.findIndex(r => r.sourceColumnId == sourceColumnId && r.targetColumnId == targetColumnId);
        if (ri != -1) {
            relations.value.splice(ri, 1);
        }
    }

    return { 
        relations, 
        addRelation, 
        getRelationByKey, 
        getRelationsByTargetTableId,
        updateRelation, 
        removeRelation 
    };
});
