(function(G){
    var t2n = { none: 0, wall: 1, strongwall: 2, gascan: 3, exit: 4, fire: 5 }
    var n2t = ['none', 'wall', 'strongwall', 'gascan', 'exit', 'fire'] 
    
    
    function Tile(type, x, y, map){
        this.type = type; this.x = x; this.y = y; this.map = map;
    }
    Tile.prototype = {
        valueOf: function(){ return n2t[this.type] },
        toString: function(){ return this.type },
        n: function(){ return this.y > 0 ? this.map[this.y - 1][this.x] : null },
        e: function(){ return this.x < this.map[0].length - 2 ? this.map[this.y][this.x + 1] : null },
        s: function(){ return this.y < this.map.length - 2 ? this.map[this.y + 1][this.x] : null },
        w: function(){ return this.x > 0 ? this.map[this.y][this.x - 1] : null }
    }
    
    function Level(width, height) {
        this.sz = 5 // tunnel size (including space for walls)
        
        width = Math.ceil((width||50)/this.sz) * this.sz
        height = Math.ceil((height||50)/this.sz) * this.sz
        
        this.map = this.initMap(width, height)
        this.addGasCans(0.1)
        
        var maze = this.makeMaze()
        console.info(maze)
    }
    
    Level.prototype = {
        initMap: function(w, h) {
            var map = []
            for (var y = 0; y < h; y ++) {
                var row = []
                for (var x = 0; x < w; x ++) {
                    var tile;
                    if (x == 0 || x == w-1 || y == 0 || y == h-1){
                        tile = new Tile('wall', x, y, map)
                    } else {
                        tile = new Tile('none', x, y, map)
                    }
                    row.push(tile)
                }
                map.push(row)
            }
            return map;
        },
        walk: function(fn) {
            for(var row = 1; row < this.map.length - 1; ++row) {
                for (var col = 1; col < this.map[0].length; ++col) {
                    fn(this.map[row][col]);
                }
            }
        },
        randomCoordinate: function(pad){
            return {
                row: pad + Math.floor(Math.random() * (this.map.length - pad*2)),
                col: pad + Math.floor(Math.random() * (this.map[0].length - pad*2))
            }  
        },
        addGasCans: function(density) {
            this.walk(function(tile) {
                if (Math.random() < density) {
                    tile.type = "gascan";
                }
            })  
        },
        makeMaze: function(){
            var w = this.map[0].length / this.sz
            var h = this.map.length / this.sz
            var mazeMap = this.initMap(w, h)
            var start = this.randomCoordinate.call({map: mazeMap}, 1)
            var remaining = w * h - 1
            //while (remaining > 0){
                
                //walk(mazeMap, function(tile, x, y, dir){
                //    
                //})
            //}
        }
    }
    
    G.generateRandomLevel = function(width, height){
        return new Level(width, height)
    }
    
})(this)
