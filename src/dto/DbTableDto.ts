export default interface DbTableDto {
    id: string;
    name: string;
    posX: number;
    posY: number;
    isAbstract: boolean;
    color?: string;
}