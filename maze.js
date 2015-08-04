// *****************************************************************************
//  filename:       maze.js
//  purpose:        contains the Maze object constructor and prototypes
//                  employs Wilson's algorithm for generating a unbiased random
//                  spanning tree of a 2D array
//                  also contains Cell object for use with Maze object
//  written by:     Martin Humphreys and Jonathan Melcher on July 28, 2015
//  last updated:   July 30, 2015
// *****************************************************************************

// *****************************************************************************
//  function:   Cell
//  purpose:    constructor
//  parameters: row
//              col
// *****************************************************************************
function Cell(row, col) {
    
    this.row = row;
    this.col = col;
    this.direction = 0;
    this.isStacked = false;
    this.isPartOfMaze = false;
    this.north = true;
    this.south = true;
    this.west = true;
    this.east = true;
}

// *****************************************************************************
//  function:   isEqualTo (Cell)
//  purpose:    compare two Cell objects for equality
//  parameters: other (Cell)
// *****************************************************************************
Cell.prototype.isEqualTo = function(other) {
    return this.row === other.row && this.col === other.col;
}

// *****************************************************************************
//  function:   Maze
//  summary:    constructor
//  parameters: height
//              width
// *****************************************************************************
function Maze(height, width) {
    
    this.height = height;
    this.width = width;
    this.grid = createArray2D(height, width, function(i, j) { return new Cell(i, j) });
}

// *****************************************************************************
//  function:   toString (Maze)
//  purpose:    2D string array of .grid for debugging in console
//  parameters: none
// *****************************************************************************
Maze.prototype.toString = function() {
    return this.grid.map(function(row) { 
        return row.map(function(col) {
            switch (col.direction) {
                case 1: return "↑";
                case 2: return "↓";
                case 3: return "←";
                case 4: return "→";
                default: return "O";
            }
        }).join("");
    }).join("\n");
}

// *****************************************************************************
//  function:   getCell
//  summary:    retrieves the Cell located in .grid at the given row/col
//  parameters: row
//              col
//  notes:      any row/col off of .grid will yield undefined
// *****************************************************************************
Maze.prototype.getCell = function(row, col) {
    return isValidCoordinate(row, col, this.width, this.height) ?
                                 this.grid[row][col] : undefined;
}

// *****************************************************************************
//  function:   getNextCell
//  summary:    retrieve Cell obtained by moving from given cell in the given
//              direction on .grid
//  parameters: cell
//              direction
//  notes:      any movement off of .grid will yield undefined
// *****************************************************************************
Maze.prototype.getNextCell = function(cell, direction) {
    
    switch (direction) {
        case 'north':       // north
            return this.getCell(cell.row - 1, cell.col);
        case 'south':       // south
            return this.getCell(cell.row + 1, cell.col);
        case 'west':        // west
            return this.getCell(cell.row, cell.col - 1);
        case 'east':        // east
            return this.getCell(cell.row, cell.col + 1);
    }
    
    return cell;
}

// *****************************************************************************
//  function:   getNextCellNotPartOfMaze
//  summary:    retrieve Cell obtained by finding the next Cell in order from
//              the given cell which is not isPartOfMaze
//  parameters: cell
//  notes:      if no cell is found will yield undefined
// *****************************************************************************
Maze.prototype.getNextCellNotPartOfMaze = function(cell) {
    return searchArray2D(
        this.grid, cell.row, 0, function(cell) { return !cell.isPartOfMaze });
}

// *****************************************************************************
//  function:   removeWall
//  summary:    removes the wall from cell in its given direction, and the wall
//              in the opposing direction from the cell in the given direction
//  parameters: cell
//  notes:      only one wall will be removed where the opp. Cell is undefined
// *****************************************************************************
Maze.prototype.removeWall = function(cell) {
    
    var opposingCell = this.getNextCell(cell, cell.direction);
    
    if (cell === undefined || cell.isEqualTo(opposingCell)) {
        return;
    }
    
    cell[cell.direction] = false;
    if (opposingCell !== undefined) {
        opposingCell[getOpposingDirection(cell.direction)] = false;
    }
}

// *****************************************************************************
//  function:   removeDuplicateWalls
//  summary:    singles the walls that remain in the .grid, since each wall has
//              an opposing wall (except for the borders)
//  parameters: none
// *****************************************************************************
Maze.prototype.removeDuplicateWalls = function() {
    
    var _this = this;
    var fn = function(cell) {
        
        COMPASS.forEach(function(direction) {
            var oppCell;
            if (cell[direction]) {
                oppCell = _this.getNextCell(cell, direction);
                if (oppCell !== undefined
                    && oppCell[getOpposingDirection(direction)]) {
                    cell[direction] = false;
                }
            }
        });
    };
    
    actOnArray2D(_this.grid, fn);
}

// *****************************************************************************
//  function:   removeRandomInsideWall
//  summary:    removes a random wall that is not along the border even if that
//              wall has already been removed
//  parameters: none
// *****************************************************************************
Maze.prototype.removeRandomInsideWall = function() {
    
    var cell;
    var oppCell = undefined;
    
    while (oppCell === undefined) {
        var row = Math.floor(Math.random() * this.height);
        var col = Math.floor(Math.random() * this.width);
        var direction = getRandomDirection();
        cell = this.getCell(row, col);
        oppCell = this.getNextCell(cell, direction);
    }
    
    cell[direction] = false;
    oppCell[getOpposingDirection(direction)] = false;
}

// **************************************************************************
//  WILSON'S ALGORITHM FOR AN UNBIASED RANDOM SPANNING TREE OVER A 2D ARRAY
//  INCLUDES THE FOLLOWING FUNCTIONS:
//
//  generate() -> processes algorithm (call on newly constructed Maze object)
//  getNextCellNotPartOfMaze() -> used for finding next cell to randomly walk
//                              from until 'isPartOfMaze' is found
//  randomWalkToMaze(initialCell)   -> random walk from an initial cell until
//              'isPartOfMaze' is found.  any loops are cleared out before
//              resuming.  path from initialCell to 'isPartOfMaze' cell is
//              returned in order to add to 'isPartOfMaze'
//  removeLoop()                    -> helper function for randomWalkToMaze
//  addAsPartOfMaze(stack)          -> helper function for randomWalkToMaze
//  removeDuplicateWalls()          -> cosmetic after-application
//  removeRandomInsideWall()        -> cosmetic after-application
//  NOTES:
//  - it is very important to set an initial cell (in our case at 0, 0) to
//    'isPartOfMaze'.  without the error check randomWalkToMaze could run
//    forever otherwise.
//  - it is very important to clear the .isStacked flags in order to not
//    confuse the removeLoop function and guarantee a spanning tree
//  - for some reason getNextCellNotPartOfMaze can start on cell.row, but
//    not cell.column (we have it at 0). think about why this is and possibly
//    change later in order to optimize
// **************************************************************************
Maze.prototype.generate = function() {
    
    var cell = this.getCell(0, 0);
    var stack;
    
    cell.isPartOfMaze = true;
    cell = this.getNextCellNotPartOfMaze(cell);
    
    while (cell !== undefined) {
        stack = this.randomWalkToMaze(cell);
        this.addAsPartOfMaze(stack);
        cell = this.getNextCellNotPartOfMaze(cell);
    }
    
    this.removeDuplicateWalls();

    // this should be a function of size probably
    for (var i = 0; i < Math.floor(this.height * this.width * WALL_REMOVAL_RATIO); ++i) {
        this.removeRandomInsideWall();
    }
}

Maze.prototype.randomWalkToMaze = function(initialCell) {
    
    var stack = [];
    var cell = initialCell;
    var nextCell;
    var direction;
    
    stack.push(initialCell);
    while (cell && !cell.isPartOfMaze) {
        
        if (cell.isStacked) {
            this.removeLoop(stack, stack.pop());
        }
        else {
            cell.isStacked = true;
        }
        
        // this error check ensures we don't run into an endless loop
        if (stack.length === (this.height * this.width)) {
            throw "error: initial isPartOfMaze not flagged";
        }
        do {
            direction = getRandomDirection();
            nextCell = this.getNextCell(cell, direction);
        }
        while (nextCell === undefined);
        
        cell.direction = direction;
        cell = nextCell;
        stack.push(cell);
    }
    
    return stack;
}

Maze.prototype.removeLoop = function(stack, cell) {
    
    var checkCell = stack[0];
    var tempCell;
    
    // while loop finished when stack is empty or a duplicate to cell is found
    while (tempCell = stack.pop()) {
        if (!tempCell.isEqualTo(cell)) {
            tempCell.isStacked = false;
            continue;
        }
        break;
    }
    
    if (!stack.length && !checkCell.isEqualTo(cell)) {
        throw "error: isStacked was not cleared on cell argument";
    }
    
    stack.push(cell);   // push cell back on when it is only copy
}

Maze.prototype.addAsPartOfMaze = function(stack) {
    
    var cell;
    while (cell = stack.pop()) {
        this.removeWall(cell);
        cell.isStacked = false;
        cell.isPartOfMaze = true;
    }
}