import type { NodeDragEvent } from "@vue-flow/core";

export default interface DesignerToolExports {
    designerClick?(ev: MouseEvent) : any;
    tableMouseDown?(ev: MouseEvent, tableId: string) : any;
    tableMouseUp?(ev: MouseEvent, tableId: string) : any;
    tableClick?(ev: MouseEvent, tableId: string) : any;
    tableMove?(x: number, y: number, tableId: string) : any;
}