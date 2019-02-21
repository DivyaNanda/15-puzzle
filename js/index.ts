import { Puzzle } from './puzzle/puzzle.ts';
import { Tile } from './puzzle/tile.ts';
import { Config } from './puzzle/config.ts';
import { PuzzleService } from './puzzle/puzzle.service.ts';

/**
 * Class responsible for handling multiple
 * puzzle boards.
 */
class Puzzler {

  //Initialize configurable elements: Puzzle rows & columns, tileSize, puzzle canvas element
  rowsElement = <HTMLInputElement> document.getElementById('tilesRow');
  columnsElement = <HTMLInputElement> document.getElementById('tilesCol');
  tileSizeElement = <HTMLInputElement> document.getElementById('tilesSize');
  puzzleElement = <HTMLCanvasElement> document.getElementById('puzzle');
  removeBoardBtn = document.getElementById("removeBoardBtn");
  ctx = this.puzzleElement.getContext("2d");
  
  service: PuzzleService;
  puzzles: Puzzle[];
  currentPuzzle: number;
  
  // Frequently used variable
  clickedTile: Tile = new Tile(0, 0);
  
  constructor() {
    this.service = new PuzzleService();
    this.puzzles = new Array<Puzzle>();
    // Set to -1, indicating no puzzle has initialized yet!
    this.currentPuzzle = -1;
    
    let newBoardBtn = document.getElementById("newBoardBtn");
    newBoardBtn.addEventListener("click", (e:Event) => this.addNewBoard());
    this.removeBoardBtn.addEventListener("click", (e:Event) => this.removeCurrentBoard());
    
    //listen for changes in row, col of puzzle and tile size
    this.rowsElement.addEventListener("change", (e:Event) => this.rowChange());
    this.columnsElement.addEventListener("change", (e:Event) => this.columnsChange());
    this.tileSizeElement.addEventListener("change", (e:Event) => this.tileSizeChange());
    
  }
  
  /**
   * Method called at start up
   * to initialize the application.
   * Creates a new puzzle instance with default configuration.
   */ 
  initialize(): void {
    let p = this.service.create();
    this.puzzles.push(p);
    this.currentPuzzle = 0;
    this.updateCanvasSize(p.getConfig());
    this.drawPuzzle(p);
    
    // Register event for tile click
    let pzzler = this;
    this.puzzleElement.onclick = function(e) {
      let activePuzzle = pzzler.puzzles[pzzler.currentPuzzle];
      const config = activePuzzle.getConfig();
      pzzler.clickedTile.x = Math.floor((e.pageY - this.offsetTop) / config.tileSize);
      pzzler.clickedTile.y = Math.floor((e.pageX - this.offsetLeft) / config.tileSize);
      
      if (pzzler.service.canTileMove(pzzler.clickedTile, activePuzzle.emptyTile)) {
        pzzler.slideTile(pzzler.clickedTile, activePuzzle);
        pzzler.drawPuzzle(activePuzzle);
      }
      
      // Notify user, he solved it!
      if (activePuzzle.isSolved()) {
        setTimeout(function() {alert("You solved it!");}, 50);
      }
    }
  }
  
  slideTile(tile: Tile, pz: Puzzle) {
    if(pz.isSolved())
      return;
    
    pz.swapWithEmptyTile(tile);
    pz.emptyTile.moveTo(tile.x, tile.y);
    
    if(this.service.isSolved(pz))
      pz.markSolved();
  }
  
  /**
   * Update Canvas size with new dimensions.
   * Updating canvas size also results in clearing
   * the previous state of canvas.
   */
  updateCanvasSize(conf: Config): void {
    const size = conf.getDimensions();
    this.puzzleElement.width = size.width;
    this.puzzleElement.height = size.height;
  }
  
  /**
   * Render puzzle with specific configuraion.
   * Fix tiles on the board.
   * Identify and color code numbered tiles and one empty tile.
   */ 
  private drawPuzzle(pz: Puzzle): void {
    const config = pz.getConfig();
    const tiles = pz.getTiles();
    const size = config.getDimensions();
    let context = this.ctx;
    context.clearRect(0, 0, size.width, size.height);
    context.textAlign = 'center';
    context.font = '10pt Calibri';
    const tileSize = config.tileSize;
    for (var i = 0; i < config.rows; i++) {
      for (var j = 0; j < config.columns; j++) {
        var tile = tiles[i][j];
        var x = j * tileSize;
        var y = i * tileSize;
        if(i != pz.emptyTile.x || j != pz.emptyTile.y) {
          context.fillStyle = config.defaultTileColor;
          context.fillRect(x, y, tileSize, tileSize);
          context.fillStyle = config.textColor;
          context.fillText(tile, x + (tileSize / 2), y + (tileSize / 2));
        } else {
          context.fillStyle = config.emptyTileColor;
          context.fillRect(x, y, tileSize, tileSize);
        }
        
        context.strokeStyle = config.tileBorderColor;
        context.lineWidth = config.padding;
        context.strokeRect(x, y, tileSize, tileSize); // Place a border around each tile.
      }
    }  
  }
    
  /**
   * Handler for changes in the row count of current puzzle.
   */
  rowChange() {
    let p = this.puzzles[this.currentPuzzle];
    let config = p.getConfig();
    config.rows = this.rowsElement.value;
    p = this.service.create(config);
    this.puzzles[this.currentPuzzle] = p;
    this.updateCanvasSize(config);
    this.drawPuzzle(p);
  }

  /**
   * Handler for changes in the column count of current puzzle
   */  
  columnsChange() {
    let p = this.puzzles[this.currentPuzzle];
    let config = p.getConfig();
    config.columns = this.columnsElement.value;
    p = this.service.create(config);
    this.puzzles[this.currentPuzzle] = p;
    this.updateCanvasSize(config);
    this.drawPuzzle(p);
  }
  
  /**
   * Handler for changes in the tileSize of current puzzle
   */
  tileSizeChange() {
    let p = this.puzzles[this.currentPuzzle];
    let config = p.getConfig();
    config.tileSize = this.tileSizeElement.value;
    
    this.updateCanvasSize(config);
    this.drawPuzzle(p);
  };
  
  /**
   * Create new board.
   */
  addNewBoard(){
    let config = new Config();
    config.rows = this.rowsElement.value;
    config.columns = this.columnsElement.value;
    config.tileSize = this.tileSizeElement.value;
    
    let p = this.service.create(config);
    this.puzzles.push(p);
    this.currentPuzzle = this.puzzles.length - 1;
    this.updateCanvasSize(config);
    this.drawPuzzle(p);
    
    // Since we're adding a puzzle here, total count cannot be 1.
    // Iterate over the puzzles and create switcher buttons
    // in the navigation pane.
    this.renderPuzzleList(this.currentPuzzle);
    this.removeBoardBtn.style.display = "block";
  }
  
  private renderPuzzleList(currentActive: number): void {
    // Remove all currently rendered puzzles
    var puzzleList = document.getElementById('puzzleList');
    while (puzzleList.firstChild) {
      puzzleList.removeChild(puzzleList.firstChild);
    }
    
    const puzzler = this;
    let puzzleItem: any;
    for(let i = 0; i < this.puzzles.length; i++) {
      puzzleItem = document.createElement("li");
      puzzleItem.appendChild(document.createTextNode("#" + (i + 1)));
      puzzleList.appendChild(puzzleItem);
      puzzleItem.addEventListener('click', function() {
        // we need to switch to i-th puzzle
        puzzler.switchPuzzle(i);
      });
      
      // Mark this item active
      if(i == currentActive)
        puzzleItem.classList.add('active');
    }
  }
  
  /**
   * Switch to puzzle present at given index.
   */ 
  switchPuzzle(index: number) {
    // Update the active class
    const puzzleList = document.getElementById('puzzleList');
    puzzleList.childNodes[this.currentPuzzle].classList.remove('active');
    puzzleList.childNodes[index].classList.add('active');
    
    this.currentPuzzle = index;

    let p = this.puzzles[this.currentPuzzle];
    let config = p.getConfig();
    this.updateCanvasSize(config);
    this.drawPuzzle(p);
    
    this.rowsElement.value = config.rows;
    this.columnsElement.value = config.columns;
    this.tileSizeElement.value = config.tileSize;
  }
  
  /**
  * Remove board
  */
  removeCurrentBoard() {
    this.puzzles.splice(this.currentPuzzle, 1);
    this.currentPuzzle = this.currentPuzzle - 1 < 0 ? 0 : this.currentPuzzle - 1;
    this.renderPuzzleList(this.currentPuzzle);
    this.switchPuzzle(this.currentPuzzle);
    
    // if only one puzzle is left, restrict remove
    if(this.puzzles.length == 1) {
        this.removeBoardBtn.style.display = "none";
    }
  }
}

// Global constant.
const puzzler = new Puzzler();

export function main(): void {
  puzzler.initialize();
}
