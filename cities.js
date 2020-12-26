class City extends Sprite {
    constructor(x, y) {
        super({x, y, z:ZTOWER, s:2, img:'city'});
        this.blocksTower = true;
    }
}

class EvilCity extends Sprite {
    constructor(x, y) {
        super({x, y, z:ZTOWER, s:2, img:'evilcity'});
        this.blocksTower = true;
    }
}


            
