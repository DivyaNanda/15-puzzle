export class Config {
    
    // Number of rows in the puzzle
    rows: number = 4;
    // Number of columns in the puzzle
    columns: number = 4;
    
    // Padding to be used in each tile (in pixels)
    padding: number = 2;
    
    // Tile size in pixels
    tileSize: number = 100;
    
    // set default colors to tiles
    defaultTileColor: string = "gray";
    emptyTileColor: string = "lightgray";
    textColor: string = "white";
    tileBorderColor: string = "white";
    
    //return dimensions of the puzzle
    getDimensions(): any {
        let height = this.tileSize * this.rows;
        let width = this.tileSize * this.columns;
        return { width: width, height: height };
    }
}