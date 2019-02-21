export class Tile {
    
    constructor(public x: number, public y: number) {}
    
    moveTo(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }
}