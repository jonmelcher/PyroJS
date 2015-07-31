// *****************************************************************************
//  GAME CONSTANTS
// *****************************************************************************

var MAX_GAS_CANS = 4;                       // total number of gas cans that can be held by the player
var MIN_EXPLOSION_RADIUS = 3;               // minimum radius (level indices) of an explosion - NOT IMPLEMENTED YET
var MAX_EXPLOSION_RADIUS = 6;               // maximum radius (level indices) of an explosion - NOT IMPLEMENTED YET
var EXPLOSION_RADIUS = 6;                   // current radius of an explosion ^-- change
var BASE_FIRE_SPREAD_PROBABILITY = 0.40;    // base probability that a fire will spread to another tile
var BASE_GAS_SPREAD_PROBABILITY = 0.10;     // base probability that gas will spread to another tile
var GAS_SPREAD_INCREASE = 0.005;            // increase amount per surrounding gas tile affecting gas spread
var FIRE_SPREAD_INCREASE = 0.03;            // increase amount per surrounding fire tile affecting fire spread
var FIRE_PERSISTENCE_PROBABILITY = 0.90;    // probability that fire will persist in a certain tile
var GAS_CAN_PROBABILITY = 0.02;             // probability of a gas can appearing in a 'none' tile - use for RNG
var DFLT_LVL_DIM = 100;                     // default level dimensions (width x height)
var PLAYER_SIZE = 3;                        // size of player (width x height)
var MAZE_CELL_TO_GAME_TILE_RATIO = 5;       // size of maze cell (n x n) to size of game tile (1x1)
var TOTAL_LEVEL_POINTS = 10000;             // points given for a perfect clear

// COMPASS - serves as an enumerator over the cardinal directions
var COMPASS = Object.freeze(['north', 'west', 'south', 'east']);