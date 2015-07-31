// *****************************************************************************
//  filename:       tile.js
//  purpose:        contains the tile object constructor and prototypes
//  written by:     Martin Humphreys and Jonathan Melcher on July 25, 2015
//  last updated:   July 30, 2015
// *****************************************************************************

// *****************************************************************************
//  function:   Tile
//  summary:    constructor
//  parameters: row
//              col
//              baseTerrain (.base value: 'none', 'fire', 'gas', etc.)
// *****************************************************************************
function Tile(row, col, baseTerrain) {

    this.row = row;
    this.col = col;
    this.base = baseTerrain;
    this.isSpreadTo = false;
}

// *****************************************************************************
//  function:   .spreadInto
//  summary:    maps .base to terrain and marks as being spread to prevent over-
//              extension of the next state calculation
//  parameters: terrain (.base value: 'none', 'fire', 'gas', etc.)
// *****************************************************************************
Tile.prototype.spreadInto = function(terrain) {
    
    this.base = terrain;
    this.spreadTo = true;
}

// *****************************************************************************
//  function:   .trySetFire
//  summary:    attempts to change .base to 'fire' based on probability and the
//              presence of player
//  parameters: probability - chance of catching fire
//              player      - used for determining proximity to player
// *****************************************************************************
Tile.prototype.trySetFire = function(probability, player) {
    
    switch (this.base) {
        case 'fuse':
        case 'gas':
            this.spreadInto('fire');
            break;
        case 'none':
            if (player.isTouching(this.row, this.col)
                && player.isAlive && !player.isFinished) {
                this.spreadInto('fire');
            }
            break;
        case 'wall':
            if (Math.random() < probability) {
                this.spreadInto('fire');
            }
            break;
    }
}

// *****************************************************************************
//  name:       getColour
//  summary:    retrieves colour associated with the current .base of Tile
//  parameters: none
// *****************************************************************************
Tile.prototype.getColour = function() {

    switch (this.base) {
        case 'gascan':
            return "#00FF00";
        case 'fuse':
            return "#FFFFFF";
        case 'wall':
            return "#555555";
        case 'strongwall':
            return "#554455";
        case 'exit':
            return "#FFFF00";
        case 'gas':
            return "rgb(80,80," + Math.floor(200 + (55 * Math.random())) + ")";
        case 'fire':
            return "rgb(" + Math.floor(155 + (100 * Math.random())) + "," +
                            Math.floor(25 + (55 * Math.random())) + ",10)";
        default:
            return "#000000";
    }
}