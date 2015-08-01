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
        this.player.move(this.level);
        if (this.ticks % 2 === 0) {
            spreadSpreadables(this.level, this.player);
        }
        this.player.refreshStatus(this.level);
    }
    else if (this.player.isAlive) {
        this.level.tiles[this.startRow][this.startCol].base = 'fire';
        this.player.isAlive = false;
    }
    else if (this.level.isOnFire()) {
        spreadSpreadables(this.level, this.player);
    }
    else {
        this.player.addScore(this.level.tiles, this.level.wallNumber);
        console.log(this.player.score);
        return false;
    }
    return true;
}