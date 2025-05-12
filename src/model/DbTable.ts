import { v4 as uuid } from 'uuid';


export default class DbTable {
    public readonly id: string;
    public name: string;
    public posX: number;
    public posY: number;
    public isAbstract: boolean;


    constructor(args: {
        id?: string,
        name?: string,
        posX?: number,
        posY?: number,
        isAbstract?: boolean
    }) {
        this.id = args.id ?? uuid();
        this.name = args.name ?? "NewTable";
        this.posX = args.posX ?? 0;
        this.posY = args.posY ?? 0;
        this.isAbstract = args.isAbstract ?? false;
    }
}