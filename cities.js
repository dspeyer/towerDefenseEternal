class City extends Sprite {
    constructor(board, x, y) {
        super(board, x, y, ZTOWER, 2, 0, 'city');
        this.blocksTower = true;
    }
}

class EvilCity extends Sprite {
    constructor(board, x, y) {
        super(board, x, y, ZTOWER, 2, 0, 'evilcity');
        this.blocksTower = true;
    }
}


            
