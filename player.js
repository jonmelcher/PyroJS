// *****************************************************************************
//  filename:       player.js
//  purpose:        contains the Player object constructor and prototypes
//  written by:     Martin Humphreys and Jonathan Melcher on July 20, 2015
//  last updated:   July 30, 2015
// *****************************************************************************

// *****************************************************************************
//  function:   Player
//  summary:    constructor
//  parameters: startRow, startCol (location of center of player on tiles)
// *****************************************************************************
function Player(startRow, startCol) {
    this.reset(startRow, startCol, true);
}

// *****************************************************************************
//  function:   reset
//  summary:    resets/makes Player properties to their default values
//              resets gasCans/score if complete reset
//  parameters: startRow
//              startCol
//              isCompleteReset
// *****************************************************************************
Player.prototype.reset = function(startRow, startCol, isCompleteReset) {
    
    this.centerX = startRow;
    this.centerY = startCol;
    this.direction = "";
    this.isAlive = true;
    this.isMoving = false;
    this.isFinished = false;
    if (isCompleteReset) {
        this.gasCans = 0;
        this.score = 0;
    }
}

// *****************************************************************************
//  function:   addScore
//  summary:    calculates ratio of walls left in tiles to an original number,
//              and adjusts Players score according to the ratio
//  parameters: tiles
//              originalWallNumber
//  notes:      when tiles is turned into a tiles object it will likely
//              encapsulate the originalWallNumber argument
// *****************************************************************************
Player.prototype.addScore = function(tiles, originalWallNumber) {
    
    var wallsLeft = tiles.tiles.reduce(function(a, b) { return a.concat(b) })
                               .reduce(function(acc, b) { return b.base === 'wall' ? ++acc : acc }, 0);
    var ratio = wallsLeft / (originalWallNumber || 1);
    
    this.score += (ratio === 0 ? TOTAL_tiles_POINTS * 2 : Math.floor(ratio * TOTAL_tiles_POINTS));
}

// *****************************************************************************
//  function:   move
//  summary:    changes player's position if necessary and updates player and
//              tiles properties
//  parameters: none
// *****************************************************************************
Player.prototype.move = function(tiles) {
    
    this.isMoving = this.isAlive && !this.isFinished && this.direction
                                            && this.isValidMove(tiles);
    
    if (this.isMoving) {
        this.setFuse(tiles);
        this.shiftCenter();        
    }
}


// *****************************************************************************
//  function:   setDirection
//  summary:    sets direction for Player ('north', 'south', 'east', 'west', "")
//  parameters: direction
// *****************************************************************************
Player.prototype.setDirection = function(direction) {
    this.direction = direction;
}

// *****************************************************************************
//  function:   getMoveTerrain
//  summary:    gets Tiles where player would move to in next tick
//  parameters: tiles
// *****************************************************************************
Player.prototype.getMoveTerrain = function(tiles) {
    
    var moveTerrain = [];
    var offset = 2;
    
    switch (this.direction) {
        case 'north':
            offset = -2;
        case 'south':
            for (var i = -1; i < 2; ++i) {
                if (isValidCoordinate(this.centerX + i, this.centerY + offset, tiles[0].length, tiles.length)) {
                    moveTerrain.push(tiles[this.centerX + i][this.centerY + offset]);
                }
            }
            break;
        case 'west':
            offset = -2;
        case 'east':
            for (var i = -1; i < 2; ++i) {
                if (isValidCoordinate(this.centerX + offset, this.centerY + i, tiles[0].length, tiles.length)) {
                    moveTerrain.push(tiles[this.centerX + offset][this.centerY + i]);
                }
            }
            break;
    }
    
    return moveTerrain;
}

// *****************************************************************************
//  function:   isTouching
//  summary:    check if the coordinate x, y is within the player's 3x3 grid
//  parameters: x, y (location to check)
// *****************************************************************************
Player.prototype.isTouching = function(x, y) {
    return Math.abs(x - this.centerX) < 2 && Math.abs(y - this.centerY) < 2;
}

// *****************************************************************************
//  function:   isValidMove
//  summary:    checks if the next tick's player move is valid
//  parameters: tiles
// *****************************************************************************
Player.prototype.isValidMove = function(tiles) {
    
    var moveTerrain = this.getMoveTerrain(tiles);
    
    for (var i = 0; i < moveTerrain.length; ++i) {
        switch (moveTerrain[i].base){
            case 'wall':
            case 'strongwall':
                return false;
        }
    }
    
    return moveTerrain.length !== 0;
}

// *****************************************************************************
//  function:   pickUpGasCan
//  summary:    checks the area of the tiles occupied by the player for gascans
//              and if the player has room picks them up
//  parameters: tiles
// *****************************************************************************
Player.prototype.pickUpGasCan = function(tiles) {
    
    var occupied = getOccupiedTiles(tiles, this.centerX, this.centerY);
    var fn = function(tile) {
        if (tile.base === 'gascan' && this.gasCans < MAX_GAS_CANS) {
            ++this.gasCans;
            tile.base = 'none';
        }
    }.bind(this);
    
    occupied.forEach(fn);
}

// *****************************************************************************
//  function:   dropGasCan
//  summary:    checks if tile that player's center occupies contains a gascan,
//              and if not either (drops gas can - not moving) or spills gas due
//              to movement
//  parameters: tiles
//  notes:      will yield inaccurate values if player is off of tiles at all
// *****************************************************************************
Player.prototype.dropGasCan = function(tiles) {
    
    if (!this.gasCans) {
        return;
    }
    
    var occupied = getOccupiedTiles(tiles, this.centerX, this.centerY);
    var t;
    
    switch (this.gasCans) {
        case 4:
            t = occupied[8];
            break;
        case 3:
            t = occupied[6];
            break;
        case 2:
            t = occupied[2];
            break;
        default:
            t = occupied[0];
            break;
    }
    
    --this.gasCans;
    t.base = this.isMoving ? 'gas' : 'gascan';
}

// *****************************************************************************
//  function:   kill
//  summary:    updates player properties and tiles to reflect player
//              being killed
//  parameters: tiles, occupied (area on tiles player resides in)
// *****************************************************************************
Player.prototype.kill = function(tiles, occupied) {
    
    this.isAlive = false;
    this.isMoving = false;
    
    while (this.gasCans) {
        this.dropGasCan(tiles);
    }    
    occupied.forEach(function(tile) { if (tile.base !== 'gascan') tile.base = 'fire' });
}

// *****************************************************************************
//  function:   refreshStatus
//  summary:    checks if player has died or finished the game and updates tiles
//              and player properties accordingly
//  parameters: tiles
// *****************************************************************************
Player.prototype.refreshStatus = function(tiles) {
    
    var occupied = getOccupiedTiles(tiles, this.centerX, this.centerY);
    
    for (var i = 0; i < occupied.length; ++i) {
        switch (occupied[i].base) {
            case 'fire':
                this.kill(tiles, occupied);
                break;
            case 'exit':
                this.isFinished = true;
                this.setFuse(tiles);
                return;
        }
    }
}

// *****************************************************************************
//  function:   setFuse
//  summary:    sets fuse at player's center (when movement occurs, player will
//              trail a fuse behind them)
//  parameters: tiles
// *****************************************************************************
Player.prototype.setFuse = function(tiles) {

    switch (tiles[this.centerX][this.centerY].base) {
        case 'gas':
        case 'none':
            tiles[this.centerX][this.centerY].base = 'fuse';
            break;
    }    
}

// *****************************************************************************
//  function:   shiftCenter
//  summary:    shifts Player's centerX/Y properties based on its direction
//  parameters: none
// *****************************************************************************
Player.prototype.shiftCenter = function() {
    
    var offset = 1;
    
    switch (this.direction) {
        case 'north':
            offset = -1;
        case 'south':
            this.centerY += offset;
            break;
        case 'west':
            offset = -1;
        case 'east':
            this.centerX += offset;
            break;
    }    
}