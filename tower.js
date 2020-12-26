class Tower extends Sprite {
    constructor(x,y,img) {
        super({x,y,z:ZTOWER,s:2,img});
        this.blocksTower = true;
        this.blocksEnemy = true;
    }
    onTick() {
        this.theta += 1;
        this.redraw();
    }
}
