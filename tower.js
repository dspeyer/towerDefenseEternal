class Tower extends Sprite {
    constructor(board,x,y,img) {
        super(board,x,y,ZTOWER,2,0,img);
        this.blocksTower = true;
        this.blocksEnemy = true;
    }
    onTick() {
        this.theta += 1;
        this.redraw();
    }
}
