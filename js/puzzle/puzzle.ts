import { Config } from './config.ts';
import { Tile } from './tile.ts';

export class Puzzle {
    
    private solved: boolean = false;
    
    constructor(private tiles: number[][], 
        private config: Config,
        public emptyTile: Tile) {
        this.solved = false;
    }
    
    getTiles(): number[][] {
        return this.tiles;
    }
    
    getConfig(): Config {
        return this.config;
    }
    
    markSolved(): void {
        this.solved = true;
    }
    
    isSolved(): boolean {
        return this.solved;
    }
    
    swapWithEmptyTile(tile: Tile): void {
        let et = this.emptyTile;
        let temp = this.tiles[tile.x][tile.y];
        this.tiles[tile.x][tile.y] = this.tiles[et.x][et.y];
        this.tiles[et.x][et.y] = temp;
    }
}