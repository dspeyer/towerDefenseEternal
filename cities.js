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
        } else {
            board.recalcTargetting();
        }
    }
}

class EvilCity extends Sprite {
    constructor(x, y) {
        super({x, y, z:ZTOWER, s:2, img:'evilcity'});
        this.blocksTower = true;
        this.vvcr = 0.0001;
        this.vcr = this.initvcr = 0.01;
        this.finalvcr = 0.3;
        this.cr = 0;
        this.pickEnemy();
    }
    
    onTick(){
        this.vcr += this.vvcr;
        this.cr += this.vcr;
        let perc = 100 * (this.vcr - this.initvcr) / (this.finalvcr - this.initvcr);
        document.getElementById('vcr').innerText = Math.round(perc)+'%';
        let enemyCount = Object.values(board.sprites).filter((x)=>(x instanceof Enemy)).length;
        if (this.vcr > this.finalvcr) {
            if (enemyCount == 0) {
                document.getElementById('victory').style.display = 'block';
                clearInterval(board.ticker);
            }
            return;
        }
        if (this.cr>=this.nextEnemy.cr && enemyCount<30) {
            this.spawnEnemy(this.nextEnemy);
            if (Math.random()<.3) {
                this.pickEnemy();
            }
        }
    }

    wrandom() {
        let pow = (1 - this.vcr / this.finalvcr) / 2;
        return Math.pow(Math.random(),pow);
    }
    
    pickEnemy() {
        let speed = Math.floor(this.wrandom()*3);
        let big = this.wrandom()<.5;
        let guns = (speed!=2) && (this.wrandom()<.5);
        if (this.cr > 5) {
            // We got stalled on maxenemies
            big = true;
        }
        let cr = speed + guns + big + 1;
        this.nextEnemy = {speed,guns,big,cr};
    }

    spawnEnemy(opts) {
        new Enemy(this.x,this.y,opts);
        this.cr -= opts.cr;
        this.prevEnemy = opts;
    }

}


            
