class Enemy extends Sprite {
    constructor(x,y,opts) {
        let img,s;
        if (opts.speed==0 && ! opts.guns) img = 'warriors';
        if (opts.speed==1 && ! opts.guns) img = 'chariot';
        if (opts.speed==2 && ! opts.guns) img = 'horsemen';
        if (opts.speed==0 && opts.guns) img = 'marines';
        if (opts.speed==1 && opts.guns) img = 'tank';
        s = opts.big ? .95 : .7;
        super({x,y,z:ZENEMY,s,img});
        for (let k in opts) {
            this[k] = opts[k];
        }
        let hp = this.big ? 1200 : 400;
        //let mult = Math.pow(2,board.totcr/80);
        let mult = 1+Math.pow(board.totcr/100, 1.5);
        document.getElementById('enemyHpMult').innerText=mult.toFixed(2)+'x';
        hp *= mult;
        hp = Math.ceil(hp);
        this.hp = new HP(this, hp);
        this.cr += Math.floor(mult);
        this.vx = 0;
        this.vy = 0;
        this.maxSpeed = ([0.01, 0.03, 0.02])[this.speed];
        this.accel = (this.speed==2) ? 0.002 : 0.001;
        this.isEnemy = true;
        this.targettable();
        board.enemies[this.uid] = this;
    }

    onTick() {
        let dx=0, dy=0;
        let fx = this.x-Math.floor(this.x);
        let fy = this.y-Math.floor(this.y);
        for (let sx of [0,1]) {
            for (let sy of [0,1]) {
                let r = (sx ? fx : 1-fx) * (sy ? fy : 1-fy);
                try {
                    let [sdx,sdy] = board.targetting[Math.floor(this.x)+sx][Math.floor(this.y)+sy].dir;
                    dx += sdx * r;
                    dy += sdy * r;
                } catch (e) {
                }
            }
        }
        let maxSpeed = this.maxSpeed;
        if (board.spritesOverlapping(this,(x)=>(x.img=='swamp'))) {
            maxSpeed /= 2;
        }
        if (dx==0) dx = maxSpeed * (Math.random()-0.5) / 5;
        if (dy==0) dy = maxSpeed * (Math.random()-0.5) / 5;
        this.vx += dx * this.accel;
        this.vy += dy * this.accel;
        let speed = Math.sqrt( this.vx*this.vx + this.vy*this.vy );
        if (speed > maxSpeed) {
            this.vx *= maxSpeed / speed;
            this.vy *= maxSpeed / speed;
        }
        let nx = this.x + this.vx;
        let ny = this.y + this.vy;
        let tangible = board.spritesOverlapping(this,(x)=>(x.blocksEnemy)) == 0;
        let xblockers=[], yblockers=[];
        if (nx<0 || nx>board.width-1) {
            this.vx = 0;
        } else if (tangible) {
            xblockers = board.spritesOverlapping({x:nx, y:this.y, s:this.s}).filter((x)=>(x.blocksEnemy));
            if (xblockers.length) {
                this.vx = 0;
            }
        }

        if (ny<0 || ny>board.height-1) {
            this.vy = 0;
        } else if (tangible) {
            yblockers = board.spritesOverlapping({x:this.x, y:ny, s:this.s}).filter((x)=>(x.blocksEnemy));
            if (yblockers.length) {
                this.vy = 0;
            }
        }
        if (board.targetting[Math.round(this.x)][Math.round(this.y)].dist>=CHEATCOST) {
            console.log('breaking blockers',xblockers,yblockers);
            xblockers.map((b)=>(b.hp?.hurt(10)));
            yblockers.map((b)=>(b.hp?.hurt(10)));
        }
        this.theta = Math.atan2(this.vy,this.vx) * 180 / Math.PI;
        this.x += this.vx;
        this.y += this.vy;
        let cities = board.spritesOverlapping(this).filter((x)=>(x instanceof City));
        if (cities.length) {
            cities.forEach((city)=>{city.hp.hurt(this.big ? 2 : 1);});
            this.destroy();
        }
    }

    destroy() {
        board.money += this.cr;
        delete board.enemies[this.uid];
        super.destroy();
    }
}

class HP {
    constructor(owner, mx) {
        this.owner = owner
        this.holder = owner.elem;
        this.max = mx;
        this.current = mx;
    }
    hurt(x) {
        this.current -= x;
        if (this.current <= 0) {
            this.owner.destroy();
        }
        if (! this.elem) {
            this.elem = document.createElement('div');
            this.elem.className = 'hpbar';
            this.holder.appendChild(this.elem);
        }
        let p = this.current / this.max;
        this.elem.style.background = 'linear-gradient(to right, white 0%, white '+Math.max(100*p-5,0)+'%, #700 '+Math.min(100*p+5,100)+'%, #700 100%)';
    }
}
