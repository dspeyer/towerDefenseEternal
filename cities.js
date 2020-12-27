class City extends Sprite {
    constructor(x, y) {
        super({x, y, z:ZTOWER, s:2, img:'city'});
        this.blocksTower = true;
        this.hp = new HP(this, 10);
    }

    destroy() {
        super.destroy();
        if (Object.values(board.sprites).filter((x)=>(x instanceof City)).length == 0) {
            clearInterval(board.ticker);
            document.getElementById('defeat').style.display='block';
        }
    }
}

class EvilCity extends Sprite {
    constructor(x, y) {
        super({x, y, z:ZTOWER, s:2, img:'evilcity'});
        this.blocksTower = true;
        this.vcr = 0.01;
        this.cr = 0;
        this.prevEnemy = { cr: Infinity };
    }
    
    onTick(){
        //this.vcr += 0.0001;
        this.cr += this.vcr;
        if (this.cr>this.prevEnemy.cr) {
            if (Math.random()<.6) {
                this.spawnEnemy(this.prevEnemy);
            } else {
                this.prevEnemy = { cr: Infinity };
            }
        }
        if (Math.random() < (this.cr-1)/400) {
            while(true) {
                let speed = Math.floor(Math.random()*3);
                let guns = Math.random()<.5;
                let big = Math.random()<.5;
                if (speed==2 && guns) continue;
                let cr = speed + guns + big + 1;
                if (cr < this.cr) {
                    this.spawnEnemy({speed,guns,big,cr});
                    break;
                }
            }
        }
    }

    spawnEnemy(opts) {
        new Enemy(this.x,this.y,opts);
        this.cr -= opts.cr;
        this.prevEnemy = opts;
    }

}


            
