class Tile extends Sprite {
    constructor(x,y,img) {
        super({x, y, z:ZTILE, s:1, img});
        this.blocksTower = (img in {'jungle':1, 'swamp':1, 'mountains':1});
        this.blocksEnemy = (img in {'jungle':1, 'hills':1, 'mountains':1});
        this.elem.style.border = '1px dashed rgba(255,255,255,0.3)';
    }
}
