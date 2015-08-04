function Pyro() {
    
    this.player = new Player(-1, -1);
    this.level = null;
    this.levelNumber = 0;
    this.ticks = 0;
    this.levelRunning = false;
}

Pyro.prototype.startNewLevel = function(height, width, settings) {
    this.level = new Level(height, width, settings);
    this.player.reset(this.level.start.r, this.level.start.c, false);
    ++this.levelNumber;
    this.ticks = 0;
    this.levelRunning = true;
}

Pyro.prototype.tick = function() {
    
    ++this.ticks;
    
    if (this.player.isAlive && !this.player.isFinished) {
        this.player.move(this.level);
        if (this.ticks % 2 === 0) {
            spreadSpreadables(this.level, this.player);
        }
        this.player.refreshStatus(this.level);
    }
    else if (this.player.isAlive) {
        this.level.tiles[this.level.start.r][this.level.start.c].base = 'fire';
        this.player.isAlive = false;
    }
    else if (this.level.isOnFire()) {
        spreadSpreadables(this.level, this.player);
    }
    else {
        this.player.addScore(this.level, this.level.wallNumber);
        return false;
    }
    return true;    
}