import DbTableInheritanceKind from "@/model/DbTableInheritanceKind";
import DbTableRelationKind from "@/model/DbTableRelationKind";

import { defineStore } from "pinia";
import { ref } from "vue";


export const useDesignerStateStore = defineStore('DesignerState', () => {
    const clientX = ref(0);
    const clientY = ref(0);
    const tableMovingActive = ref(true);
    const tableCreationActive = ref(false);
    const selectedTableRelationKind = ref(DbTableRelationKind.OneToMany);
    const selectedTableInheritanceKind = ref(DbTableInheritanceKind.ConcreteTable);

    function setDesignerClientPosition(x: number, y: number) {
        clientX.value = x;
        clientY.value = y;
    }

    function toggleTableMoving(active: boolean) {
        tableMovingActive.value = active;
        if (active) {
            tableCreationActive.value = false;
        }
    }

    function toggleTableCreation(active: boolean) {
        tableCreationActive.value = active;
        if (active) {
            tableMovingActive.value = false;
        }
    }

    function setSelectedTableRelationKind(kind: DbTableRelationKind) {
        selectedTableRelationKind.value = kind;
    }

    function setSelectedTableInheritanceKind(kind: DbTableInheritanceKind) {
        selectedTableInheritanceKind.value = kind;
    }

    
    return {
        clientX, clientY,
        tableMovingActive,
        tableCreationActive,
        selectedTableRelationKind,
        selectedTableInheritanceKind,
        setDesignerClientPosition,
        toggleTableMoving,
        toggleTableCreation,
        setSelectedTableRelationKind,
        setSelectedTableInheritanceKind
    }
});