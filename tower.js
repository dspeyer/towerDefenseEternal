const towerStats = {
    cannon: {
        range: 6,
        damage: 40,
        reloadTime: 20,
        ammo: 'cannonball',
        ammosize: 0.2,
        cost: 5
    },
    artillery: {
        range: 4,
        damage: 4,
        reloadTime: 4,
        ammo: 'shells',
        ammosize: 0.2,
        cost: 5
    },
    howitzer: {
        range: 4,
        damage: 10,
        reloadTime: 25,
        ammo: 'rocket',
        ammosize: 0.5,
        cost: 10
    },
    laser: {
        range: 4,
        damage: 0.1,
        reloadTime: 50,
        ammo: 'laserbolt',
        ammosize: 0.2,
        cost: 15
    },
    flamethrower: {
        range: 3,
        damage: 0.2,
        reloadTime: 3,
        ammo: 'flame',
        ammosize: 0.5,
        cost: 15
    },
    pusher: {
        range: 4,
        damage: 0.1,
        reloadTime: 50,
        ammo: 'wind',
        ammosize: 1,
        cost: 10
    }
}

function sq(x) {
    return x*x;
}

class Tower extends Sprite {
    constructor(x,y,img) {
        super({x,y,z:ZTOWER,s:2,img});
        this.blocksTower = true;
        this.blocksEnemy = true;
        let stats = towerStats[img];
        for (let k in stats) {
            this[k] = stats[k];
        }
        this.reload = 0;
        if (img=='laser') {
            this.firing = 0;
        }
        board.money -= this.cost;
        board.onMoneyChange();
        this.elem.addEventListener('click', this.onClick.bind(this));
    }

    onTick() {
        if (this.firing) {
            new Ammo(this);
            this.firing--;
            return;
        }
        this.reload++;
        let targets = board.spritesOverlapping(this.x, this.y, 2*this.range)
                           .filter((e)=>(e instanceof Enemy))
                           .filter((e)=>(sq(e.x-this.x)+sq(e.y-this.y)<sq(this.range)));
        if ( ! targets.length) {
            this.theta += 1;
            this.redraw();
            return;
        }
        let bestT = targets[0], bestV=Infinity;
        for (let target of targets) {
            try {
                let dist = board.targetting[Math.round(target.x)][Math.round(target.y)].dist;
                if (dist < bestV) {
                    bestV = dist;
                    bestT = target;
                }
            } catch (e) {
                if ( ! (e instanceof TypeError) ) throw e;
            }
        }
        this.theta = Math.atan2(bestT.y-this.y, bestT.x-this.x) * 180 / Math.PI;
        this.redraw();
        if (this.reload >= this.reloadTime) {
            new Ammo(this);
            this.reload = 0;
            if (this.img=='laser') {
                this.firing = 10;
            }
        }
    }

    async onClick() {
        let range = new Sprite({x:this.x, y:this.y, z:ZTOWER, s:this.range});
        range.setGradient('radial-gradient(transparent, transparent 60%, rgba(255,255,255,0.7) 70%, transparent 70.7%)');
        let sellPrice = Math.round(this.cost/2);
        let choice = await board.menu(this, [{img:'upgrade',cost:this.cost}, {img:'sell',cost:-sellPrice}]);
        range.destroy();
        if (choice=='upgrade' && board.money>this.cost) {
            board.money -= this.cost;
            board.onMoneyChange();
            console.log('foo');
            this.cost *= 2;
            this.damage *= 1.5;
            this.range *= 1.1;
            this.reloadTime /= 1.1;
            this.upgraded = !!this.upgraded + 1;
            let rg = 255 - 50/this.upgraded;
            let b = 205 / this.upgraded;
            let color = `rgba(${rg},${rg},${b},0.8)`;
            let rad = 75 - 25/this.upgraded;
            this.setGradient(`radial-gradient(circle, transparent, ${color} ${rad}%, transparent ${rad+10}%)`);
        }
        if (choice=='sell') {
            board.money += sellPrice;
            board.onMoneyChange();
            this.destroy();
        }
    }
}

class Ammo extends Sprite {
    constructor({x,y,ammo,ammosize,theta,range,damage}) {
        super({x,y,theta,s:ammosize,z:ZMARKER,img:ammo});
        this.start = {x,y};
        this.range = range;
        this.damage = damage;
    }
    onTick() {
        let vx = 0.2 * Math.cos(this.theta * Math.PI / 180);
        let vy = 0.2 * Math.sin(this.theta * Math.PI / 180);
        this.x += vx;
        this.y += vy;
        if (this.img!='laserbolt' && sq(this.start.x-this.x)+sq(this.start.y-this.y) > sq(this.range)) {
            this.destroy();
            return;
        }
        let targets = board.spritesOverlapping(this.x,this.y,this.s).filter((x)=>(x instanceof Enemy));
        if (this.img=='rocket' && targets.length) {
            this.x += 2*vx;
            this.y += 2*vy;
            new Explosion(this);
            this.destroy();
            return;
        }
        for (let target of targets) {
            target.hp.hurt(this.damage);
            if (this.img in {cannonball:1, shells:1}) {
                this.destroy();
                return;
            }
            if (this.img == 'wind') {
                target.vx = vx;
                target.vy = vy;
            }
        }
    }
}

class Explosion extends Sprite {
    constructor({x,y,damage}) {
        super({x,y,s:3,z:ZMARKER,img:'explosion'});
        let enemies = board.spritesOverlapping(x,y,3);
        console.log({x,y,damage,enemies});
        enemies = enemies.filter((x)=>(x instanceof Enemy));
        console.log(enemies);
        enemies.forEach((e)=>{e.hp.hurt(damage);});
        this.elem.style.opacity=1;
    }
    onTick(){
        this.elem.style.opacity -= 0.2;
        if (this.elem.style.opacity == 0) {
            this.destroy();
        }
    }
}
                
