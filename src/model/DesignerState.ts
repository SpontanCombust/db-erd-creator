import DesignerToolMode from "./DesignerToolMode";


export default class DesignerState {
    public clientX: number;
    public clientY: number;
    public toolMode: DesignerToolMode;

    constructor() {
        this.clientX = 0;
        this.clientY = 0;
        this.toolMode = DesignerToolMode.Move;
    }
}