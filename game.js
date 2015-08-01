// *****************************************************************************
//  filename:       game.js
//  purpose:        contains main Game object constructor and prototypes
//  written by:     Martin Humphreys and Jonathan Melcher on July 20, 2015
//  last updated:   July 30, 2015
// *****************************************************************************

// *****************************************************************************
//  name:       Game
//  summary:    constructor
//  parameters: level (2D array of tile objects), startX, startY (player centre)
// *****************************************************************************
function Game(height, width) {
    
    this.level = new Level(height, width);
    this.width = this.level.width;
    this.height = this.level.height;
    this.startRow = this.level.start.r;
    this.startCol = this.level.start.c;
    this.ticks = 0;
    this.player = new Player(this.startRow, this.startCol);
    this.wallNumber = this.level.tiles.reduce(function(a, b) { return a.concat(b) })
                                      .reduce(function(acc, b) { return b.base === 'wall' ? ++acc : acc }, 0);
}

// *****************************************************************************
//  name:       .tick
//  summary:    updates level 2D array to next state and checks whether game is
//              finished
//  parameters: none
// *****************************************************************************
Game.prototype.tick = function() {
    
    this.ticks++;
    
    if (this.player.isAlive && !this.player.isFinished) {
        this.player.move(this.level.tiles);
        if (this.ticks % 2 === 0) {
            this.spreadSpreadables();
        }
        this.player.refreshStatus(this.level.tiles);
    }
    else if (this.player.isAlive) {
        this.level.tiles[this.startRow][this.startCol].base = 'fire';
        this.player.isAlive = false;
    }
    else if (isOnFire(this.level.tiles)) {
        this.spreadSpreadables();
    }
    else {
        this.player.addScore(this.level.tiles, this.wallNumber);
        console.log(this.player.score);
        return false;
    }
    return true;
}

// *****************************************************************************
//  name:       .setTerrain
//  summary:    setter for .level[x][y].base
//  parameters: level, x, y (location), terrain (what to set .base to)
// *****************************************************************************
Game.prototype.setTerrain = function(row, col, terrain) {
    if (isValidCoordinate(row, col, this.width, this.height)) {
        this.level.tiles[row][col].base = terrain || "";
    }
}

// *****************************************************************************
//  name:       .getSpreadAdjustment
//  summary:    determines amount to add to a spread probability based on the
//              number of similar terrain in a 3x3 square
//  parameters: occupied (3x3 square), terrain, adj (amount to add per similar)
// *****************************************************************************
Game.prototype.getSpreadAdjustment = function(occupied, terrain, adj) {
    return occupied.reduce(function (acc, tile) { return tile.base === terrain ? acc + adj : acc }, 0);
}


// *****************************************************************************
//  name:       .explosion
//  summary:    explodes a gas can, spreading fire in a circle about it in level
//  parameters: level, x, y (location of 'gascan'), maxDistance (from x, y)
// *****************************************************************************
Game.prototype.explosion = function(x, y, maxDistance) {
    
    var shiftX = x;
    var shiftY = y;
    var reversed = 1;
    var distance = 0;
    
    var _explosion = function(baseX, baseY){
        
        if (isValidCoordinate(shiftX, shiftY, this.width, this.height) &&
            Math.sqrt(Math.pow(shiftX - baseX, 2) + Math.pow(shiftY - baseY, 2)) < maxDistance + 1) {
            
            if (this.level.tiles[shiftX][shiftY].base === 'gasCan') {
                this.explosion(shiftX, shiftY, maxDistance);
            }
            else if (this.level.tiles[shiftX][shiftY].base !== 'exit') {
                this.level.tiles[shiftX][shiftY].spreadInto('fire');
            }
        }
    }.bind(this);
    
    this.level.tiles[shiftX][shiftY].spreadInto('fire');
    
    while (distance < maxDistance + 1) {
        
        for (var i = 0; i < distance; ++i) {
            shiftX += reversed;
            _explosion(x, y);
        }
        
        for (var i = 0; i < distance; ++i) {
            shiftY += reversed;
            _explosion(x, y);
        }

        reversed *= -1;
        ++distance;
    }
}

// *****************************************************************************
//  name:       .spreadFire
//  summary:    spreads fire probabilistically about a tile with .base = 'fire'
//              uses .spreadTo to prevent over-spreading during .tick()
//              can also call .explosion if 'gascan' is encountered
//  parameters: level, x, y (location of 'fire' tile)
// *****************************************************************************
Game.prototype.spreadFire = function(level, x, y) {
    
    var fireSpreadProbability = BASE_FIRE_SPREAD_PROBABILITY;
    var occupied = getOccupiedTiles(level, x, y);
    var fn = function(tile) {
        
        tile.trySetFire(fireSpreadProbability, this.player);
        if (tile.base === 'gascan') {
            this.explosion(tile.row, tile.col, EXPLOSION_RADIUS);
        }
    }.bind(this);
    
    fireSpreadProbability += this.getSpreadAdjustment(occupied, 'fire', FIRE_SPREAD_INCREASE);
    occupied.forEach(fn);
    
    if (Math.random() > FIRE_PERSISTENCE_PROBABILITY) {
        level[x][y].base = 'none';
    }
}

// *****************************************************************************
//  name:       .spreadGas
//  summary:    spreads gas probabilistically about a tile with .base = 'gas'
//              uses .spreadTo to prevent over-spreading during .tick()
//  parameters: level, x, y (location of 'gas' tile)
// *****************************************************************************
Game.prototype.spreadGas = function(level, x, y) {
    
    var gasSpreadProbability = BASE_GAS_SPREAD_PROBABILITY;
    var occupied = getOccupiedTiles(level, x, y);
    var fn = function(tile) {
        if (tile.base === 'none' && Math.random() < gasSpreadProbability) {
            tile.spreadInto('gas');
        }
    };
    
    gasSpreadProbability += this.getSpreadAdjustment(occupied, 'gas', GAS_SPREAD_INCREASE);
    occupied.forEach(fn);
}

// *****************************************************************************
//  name:       .spreadSpreadables
//  summary:    calculates spread of spreadables to calculate next state of the
//              level 2D array
//  parameters: none
// *****************************************************************************
Game.prototype.spreadSpreadables = function() {
    
    var fn = function(tile, i, j) {
        
        if (!tile.spreadTo) {
            switch (tile.base) {
                case 'fire':
                    this.spreadFire(this.level.tiles, i, j);
                    break;
                case 'gas':
                    this.spreadGas(this.level.tiles, i, j);
                    break;
            }
        }
    }.bind(this);
    
    actOnArray2D(this.level.tiles, fn);
    actOnArray2D(this.level.tiles, function(tile) { tile.spreadTo = false });
}