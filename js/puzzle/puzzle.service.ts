import { Config } from './config.ts';
import { Puzzle } from './puzzle.ts';
import { Tile } from './tile.ts';

export class PuzzleService {
    
    /**
     * Creates a new instance of puzzle
     * with given configuration.
     */ 
    create(config: Config): Puzzle {
        console.log("Creating new puzzle..");
        if(!config) // We need to create a default config
            config = new Config();
        
        const tilesNumber = config.rows * config.columns;
        let emptyTile = new Tile(0, 0);
        
        const values = this.prepareShuffledValues(tilesNumber);
        
        let k = 0;
        let tiles = new Array<number>(config.rows);
        for(let i = 0; i < config.rows; i++) {
            tiles[i] = new Array<number>(config.columns);
            for(let j = 0; j < config.columns; j++) {
                tiles[i][j] = values[k++];
                if(tiles[i][j] === tilesNumber) {
                    emptyTile.x = i;
                    emptyTile.y = j;
                }
            }
        }
        
        let pz = new Puzzle(tiles, config, emptyTile);
        if(!this.isSolvable(pz) || this.isSolved(pz)) {
            console.log("Encountered an unsolvable puzzle (" + tilesNumber + " denotes the empty tile)");
            console.table(tiles);
            return this.create(config);
        }
        
        return pz;
    }
    
    /**
     * Creates a shuffled array of values
     * to be initialized in the puzzle.
     */
    private prepareShuffledValues(tilesNumber: number): number[] {
        let values: number[] = Array.from(Array(tilesNumber).keys()).map(item => item + 1);

        let temp: number;
        let randomIndex: number;
        let currentIndex: number = values.length;

        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            temp = values[currentIndex];
            values[currentIndex] = values[randomIndex];
            values[randomIndex] = temp;
        }
        
        return values;
    }
    
    /**
     * Check if the puzzle is fully solved.
     */
    isSolved(puzzle: Puzzle): boolean {
        let a = 0;
        const tiles = puzzle.getTiles();
        const config = puzzle.getConfig();
        for(let i = 0; i < config.rows; i++) {
            for(let j = 0; j < config.columns; j++) {
                if(tiles[i][j] < a) 
                  return false;
                a = tiles[i][j];
            }
        }
        return true;
    }
    
    /**
     * Validate the tile's movement.
     */
    canTileMove(currentTile: Tile, emptyTile: Tile): boolean {
        const d: number = Math.abs(currentTile.x - emptyTile.x) + Math.abs(currentTile.y - emptyTile.y);
        return d == 1;
    }
    
    isSolvable(puzzle: Puzzle): boolean {
        const config = puzzle.getConfig();
        if(config.rows == config.columns) // NxN
            return this.checkNxN(puzzle.getTiles(), config.rows);
        return true;
    }
    
    private checkNxN(tiles: number[][], n: number): void {
        const invCount = this.getInversionCount(tiles, n);
        // If grid is odd, return true if inversion
        // count is even.
        if (n & 1)
            return !(invCount & 1);
        else {
            const pos = this.findXPosition(tiles, n);
            if (pos & 1)
                return !(invCount & 1);
            else
                return invCount & 1;
        }
        return false;
    }
    
    private getInversionCount(tiles: number[][], n: number): number {
        let count = 0;
        for (let i = 0; i < n * n - 1; i++) {
            for (let j = i + 1; j < n * n; j++) {
                // count pairs(i, j) such that i appears
                // before j, but i > j.
                if (tiles[j] && tiles[i] && tiles[i] > tiles[j])
                    count++;
            }
        }
        
        return count;
    }
    
    private findXPosition(tiles: number[][], n: number): number {
        // start from bottom-right corner of matrix
        const total = n * n;
        for (let i = n - 1; i >= 0; i--) {
            for (let j = n - 1; j >= 0; j--) {
                if (tiles[i][j] == total)
                    return n - i;
            }
        }
        
        return -1;
    }
    
}