import { v4 as uuid } from 'uuid';

import type DbTableColumn from "./DbTableColumn";


export default class DbTable {
    public readonly id: string;
    public name: string;
    public columns: DbTableColumn[];

    public designerPosition: { x: number, y: number };
    // public designerScale: { x: number, y: number };

    constructor(
        id: string | null,
        designerPosition: { x: number, y: number },
        // designerScale: { x: number, y: number }
    ) {
        this.id = id ?? uuid();
        this.name = "NewTable";
        this.columns = [];
        this.designerPosition = designerPosition;
        // this.designerScale = designerScale;
    }
}