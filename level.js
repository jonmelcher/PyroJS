// *****************************************************************************
//  filename:       level.js
//  purpose:        contains functions associated with level, a 2D array of
//                  Tile objects used in the Game object
//  written by:     Martin Humphreys and Jonathan Melcher on July 25, 2015
//  last updated:   July 30, 2015
// *****************************************************************************

function Level(height, width, settings) {

    var maze = new Maze(Math.floor(height / MAZE_CELL_TO_GAME_TILE_RATIO),
                        Math.floor(width / MAZE_CELL_TO_GAME_TILE_RATIO));
    maze.generate();

    this.tiles = createArray2D(maze.height * MAZE_CELL_TO_GAME_TILE_RATIO,
                                maze.width * MAZE_CELL_TO_GAME_TILE_RATIO,
                        function(i, j) { return new Tile(i, j, 'none') });
    this.height = this.tiles.length;
    this.width = this.tiles[0].length;

    this.applyWalls(maze.grid);
    this.applyStrongWalls();
    this.applyGasCans(GAS_CAN_PROBABILITY);

    for (var i = 0; i < 1; ++i) {
        this.applyExit();
    }

    this.start = this.getStartWRTExits(this.getExits());
}

Level.prototype.getSquare = function(row, col, squareSize) {

    var occupied = [];

    actOnSquare(this.tiles, row, col, squareSize, function(tile) { occupied.push(tile) });
    return occupied;
}

Level.prototype.isOnFire = function() {
    return searchArray2D(this.tiles, 0, 0, function(tile) {
        return tile.base === 'fire'}) !== undefined;
}

Level.prototype.applyGasCans = function(probability) {
    var fn = function(tile) {
        if (tile.base === 'none' && Math.random() < probability) {
            tile.base = 'gascan';
        }
    }
    
    actOnArray2D(this.tiles, fn);    
}

Level.prototype.getStart = function() {

    var row = 1 + Math.floor(Math.random() *
                (Math.round(this.height / MAZE_CELL_TO_GAME_TILE_RATIO) - 2));
    var col = 1 + Math.floor(Math.random() *
             (Math.round(this.width / MAZE_CELL_TO_GAME_TILE_RATIO) - 2));
    var location = {r: row * MAZE_CELL_TO_GAME_TILE_RATIO + 2,
                    c: col * MAZE_CELL_TO_GAME_TILE_RATIO + 2};

    return location;
}

Level.prototype.getStartWRTExits = function(exits) {

    var minDistance = Math.min(this.width, this.height) / 2;
    var isDistant;
    var fn = function(acc, exit) {
        return Math.min(acc, Math.sqrt(
            Math.pow(exit.r - start.r, 2) + Math.pow(exit.c - start.c, 2)));
    };

    do {
        var start = this.getStart();
        var distance = exits.reduce(fn, Infinity);
        isDistant = distance > minDistance;
    }
    while (!isDistant);
    return start;
}

Level.prototype.applyStrongWalls = function() {

    this.tiles[0][0].base = 'strongwall';
    this.tiles[1][0].base = 'strongwall';
    this.tiles[0][1].base = 'strongwall';
    this.tiles[0][this.width - 1].base = 'strongwall';
    this.tiles[this.width - 2].base = 'strongwall';
    this.tiles[1][this.width - 1].base = 'strongwall';
    this.tiles[this.height - 1][0].base = 'strongwall';
    this.tiles[this.height - 1][1].base = 'strongwall';
    this.tiles[this.height - 2][0].base = 'strongwall';
    this.tiles[this.height - 1][this.width - 1].base = 'strongwall';
    this.tiles[this.height - 1][this.width - 2].base = 'strongwall';
    this.tiles[this.height - 2][this.width - 1].base = 'strongwall';
}

Level.prototype.getExits = function() {

    var exits = [];
    var exitLocation;

    var fn = function(tile, row, col) {
        if (tile.base === 'exit') {
            exitLocation = {r: row, c: col};
            exits.push(exitLocation);
        }
    }

    actOnArray2D(this.tiles, fn);
    return exits;
}

Level.prototype.applyExit = function() {

    var side = getRandomDirection();
    var modifiedLevelHeight = Math.round(this.height / MAZE_CELL_TO_GAME_TILE_RATIO);
    var modifiedLevelWidth = Math.round(this.width / MAZE_CELL_TO_GAME_TILE_RATIO);
    var _applyExit = function(exitRange, wall, isWallNorthSouth) {

        var exit = 1 + Math.floor(Math.random() * (exitRange - 2));
        if (isWallNorthSouth) {
            for (var i = 1; i < MAZE_CELL_TO_GAME_TILE_RATIO - 1; ++i) {
                this.tiles[wall][exit * MAZE_CELL_TO_GAME_TILE_RATIO + i].base = 'exit';
            }
        }
        else {
            for (var i = 1; i < MAZE_CELL_TO_GAME_TILE_RATIO - 1; ++i) {
                this.tiles[exit * MAZE_CELL_TO_GAME_TILE_RATIO + i][wall].base = 'exit';
            }
        }
    }.bind(this);
    var wall = 0;

    switch (side) {
        case 'south':
            wall = this.height - 1;
        case 'north':
            _applyExit(modifiedLevelWidth, wall, true);
            break;
        case 'east':
            wall = this.width - 1;            
        case 'west':
            _applyExit(modifiedLevelHeight, wall, false);
            break;
    }
}

Level.prototype.applyWalls = function(grid) {

    var _applyWalls = function(row, col, offset, wallsAreEastWest) {
        
        if (wallsAreEastWest) {
            for (var k = 0; k < MAZE_CELL_TO_GAME_TILE_RATIO; ++k) {
                this.tiles[row + k][col + offset].base = 'wall';
            }
        }
        else {
            for (var k = 0; k < MAZE_CELL_TO_GAME_TILE_RATIO; ++k) {
                this.tiles[row + offset][col + k].base = 'wall';
            }
        }
    }.bind(this);
    var fn = function(cell, row, col) {
        
        var offset;
        for (var k = 0; k < COMPASS.length; ++k) {
            if (cell[COMPASS[k]]) {
                offset = k > 1 ? MAZE_CELL_TO_GAME_TILE_RATIO - 1 : 0;
                _applyWalls(row * MAZE_CELL_TO_GAME_TILE_RATIO,
                            col * MAZE_CELL_TO_GAME_TILE_RATIO,
                                          offset, k % 2 !== 0);
            }
        }
    };
    
    actOnArray2D(grid, fn);    
}

// *****************************************************************************
//  function:   getOccupiedTiles
//  summary:    retrieves array representing 3x3 square of tiles on level
//              in the following form:
//              0 1 2
//              3 4 5
//              6 7 8
//  parameters: level, row, col (location of center of desired 3x3 square)
// *****************************************************************************
function getOccupiedTiles(level, row, col) {
    
    var occupied = [];
    
    for (var i = -1; i < 2; ++i) {
        for (var j = -1; j < 2; ++j) {
            if (isValidCoordinate(row + i, col + j, level[0].length, level.length)) {
                occupied.push(level[row + i][col + j]);
            }
        }
    }
    
    return occupied;
}

// *****************************************************************************
//  function:   isOnFire
//  summary:    checks if any tiles in the level have a .base of 'fire'
//  parameters: level
// *****************************************************************************
function isOnFire (level) {
    return searchArray2D(level, 0, 0, function(tile) { 
        return tile.base === 'fire' }) !== undefined;
}

// *****************************************************************************
//  function:   applyGasCans
//  summary:    probabilistically changes 'none' .base Tiles to 'gascan' Tiles
//              throughout level
//  parameters: level
//              probability (that a gascan will appear)
// *****************************************************************************
function applyGasCans(level, probability) {
    
    var fn = function(element) {
        if (element.base === 'none' && Math.random() < probability) {
            element.base = 'gascan';
        }
    }
    
    actOnArray2D(level, fn);
}

// *****************************************************************************
//  function:   getStartPosition
//  summary:    picks a random 3x3 'none' Tile grid to place the player on and
//              yields its center location
//  parameters: level
//  notes:      return is an anonymous object {r: (row), c: (col)}
// *****************************************************************************
function getStartPosition(level) {
    
    var row = 1 + Math.floor(Math.random() *
                (Math.round(level.length / MAZE_CELL_TO_GAME_TILE_RATIO) - 2));
    var col = 1 + Math.floor(Math.random() *
             (Math.round(level[0].length / MAZE_CELL_TO_GAME_TILE_RATIO) - 2));
    var location = {r: row * MAZE_CELL_TO_GAME_TILE_RATIO + 2,
                    c: col * MAZE_CELL_TO_GAME_TILE_RATIO + 2};
    return location;
}

// *****************************************************************************
//  function:   getStartPositionWRTExits
//  summary:    finds a start position with minimum distance from the list of
//              exit locations
//  parameters: level
//              exits - array of anonymous locations {r: (row), c: (col)} where
//                      an 'exit' Tile is found
//  notes:      return is an anonymous object {r: (row), c: (col)}
// *****************************************************************************
function getStartPositionWRTExits(level, exits) {
    
    var minDistance = Math.min(level[0].length, level.length) / 2;
    var isDistant;
    var fn = function(acc, exit) {
        return Math.min(acc, Math.sqrt(
            Math.pow(exit.r - start.r, 2) + Math.pow(exit.c - start.c, 2)));
    };
    
    do {
        var start = getStartPosition(level);
        var distance = exits.reduce(fn, Infinity);
        isDistant = distance > minDistance;
    }
    while (!isDistant);
    return start;
}

// *****************************************************************************
//  function:   applyStrongWalls
//  summary:    changes corner Tile .base's to 'strongwall'
//  parameters: level
//  notes:      bit crude, not sureif there is a better way to do this
//              other than directly
// *****************************************************************************
function applyStrongWalls(level) {
    
    level[0][0].base = 'strongwall';
    level[1][0].base = 'strongwall';
    level[0][1].base = 'strongwall';
    level[0][level[0].length - 1].base = 'strongwall';
    level[0][level[0].length - 2].base = 'strongwall';
    level[1][level[0].length - 1].base = 'strongwall';
    level[level.length - 1][0].base = 'strongwall';
    level[level.length - 1][1].base = 'strongwall';
    level[level.length - 2][0].base = 'strongwall';
    level[level.length - 1][level[0].length - 1].base = 'strongwall';
    level[level.length - 1][level[0].length - 2].base = 'strongwall';
    level[level.length - 2][level[0].length - 1].base = 'strongwall';
}

// *****************************************************************************
//  function:   getExits
//  summary:    retrieves an array of locations of 'exit' .base Tiles
//  parameters: level
//  notes:      return is an array of anonymous objects {r: (row), c: (col)}
// *****************************************************************************
function getExits(level) {
    
    var exits = [];
    var exitLocation;
    
    var fn = function(tile, i, j) {
        if (tile.base === 'exit') {
            exitLocation = {r: i, c: j};
            exits.push(exitLocation);
        }
    }
    
    actOnArray2D(level, fn);
    return exits;
}

// *****************************************************************************
//  function:   applyExit
//  summary:    randomly chooses a side and location for an exit to appear on
//              the level
//  parameters: level
// *****************************************************************************
function applyExit(level) {
    
    var side = getRandomDirection();
    var modifiedLevelHeight = Math.round(level.length /
                         MAZE_CELL_TO_GAME_TILE_RATIO);
    var modifiedLevelWidth = Math.round(level[0].length /
                           MAZE_CELL_TO_GAME_TILE_RATIO);
    var _applyExit = function(exitRange, wall, isWallNorthSouth) {
        
        var exit = 1 + Math.floor(Math.random() * (exitRange - 2));
        if (isWallNorthSouth) {
            for (var i = 1; i < MAZE_CELL_TO_GAME_TILE_RATIO - 1; ++i) {
                level[wall][exit * MAZE_CELL_TO_GAME_TILE_RATIO + i].base = 'exit';
            }
        }
        else {
            for (var i = 1; i < MAZE_CELL_TO_GAME_TILE_RATIO - 1; ++i) {
                level[exit * MAZE_CELL_TO_GAME_TILE_RATIO + i][wall].base = 'exit';
            }
        }
    }
    var wall = 0;
    
    switch (side) {
        case 'south':
            wall = level.length - 1;
        case 'north':
            _applyExit(modifiedLevelWidth, wall, true);
            break;
        case 'east':
            wall = level[0].length - 1;            
        case 'west':
            _applyExit(modifiedLevelHeight, wall, false);
            break;
    }
}