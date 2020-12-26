class Tile extends Sprite {
    constructor(board,x,y,img) {
        super(board, x, y, 0, 1, 0, img);
        this.blocksTower = (img in {'jungle':1, 'swamp':1, 'mountains':1});
        this.blocksEnemy = (img in {'jungle':1, 'hills':1, 'mountains':1});
    }
}
