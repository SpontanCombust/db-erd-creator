import type DbTableColumn from "./DbTableColumn";

export default class DbTable {
    public name: string;
    public columns: DbTableColumn[];

    public designerPosition: { x: number, y: number };
    // public designerScale: { x: number, y: number };

    constructor(
        designerPosition: { x: number, y: number },
        // designerScale: { x: number, y: number }
    ) {
        this.name = "New Table";
        this.columns = [];
        this.designerPosition = designerPosition;
        // this.designerScale = designerScale;
    }
}