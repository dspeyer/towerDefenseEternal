const ZTILE = 0;
const ZARROW = 5;
const ZTOWER = 10;
const ZENEMY = 20;
const ZAMMO = 30;
const ZCOVER = 40;
const ZBUTTON = 50;

class Board {
    constructor(id) {
        this.elem = document.getElementById(id);
        let rect = this.elem.getBoundingClientRect();
        this.width = Math.max(Math.floor(rect.width / 60), 8);
        this.height = Math.max(Math.floor(rect.height / 60), 6);
        this.r = Math.min(rect.width / (this.width+1), rect.height / (this.height+1));
        this.elem.style.width = this.width * this.r + 'px';
        this.elem.style.height = this.height * this.r + 'px';
        this.sprites = {};
        this.spritesByPlace = Array(this.width).fill().map(()=>Array(this.height).fill().map(()=>({})));
        this.targetting = Array(this.width).fill().map(()=>Array(this.height).fill().map(()=>({dist:42,dir:[0,0]})));
        this.tickCount = 0;
        this.elem.addEventListener('click', this.onClick.bind(this));
        document.getElementById('slider').addEventListener('change', this.setTickRate.bind(this));
        document.getElementById('dirs').addEventListener('click', this.showHideTargetting.bind(this));
    }

    start() {
        this.money = 0;
        let canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        document.body.appendChild(canvas);
        let ctx = canvas.getContext('2d');
        ctx.font = (this.height-2)+'px sans';
        let undrawable = getPx('\uFFFF');
        let nfeatures = Math.round(Math.random()*3)+3;
        for (let i=0; i<nfeatures; i++) {
            let which = Math.floor(Math.random()*2);
            if (which==0) {
                let chr;
                while (true) {
                    let n = Math.round(Math.random() * 0x1F6D4);
                    if (n>0x4e00 && n<0x9fff && Math.random()<0.8) continue; // De-emphasize unihan
                    chr = String.fromCodePoint(n);
                    if (getPx(chr).data.toString() != undrawable.data.toString()) break;
                }
                ctx.fillStyle = 'rgba('+Math.floor(Math.random()*255)+', 0, 0, '+Math.floor(Math.random()*255)+')';
                ctx.fillText(chr,Math.floor(Math.random()*(this.width-this.height)),this.height-3);
            }
            if (which==1) {
                ctx.strokeStyle = 'rgba('+Math.floor(Math.random()*255)+', 0, 0, '+Math.floor(Math.random()*255)+')';
                ctx.moveTo(Math.random()*this.width, Math.random()*this.height);
                ctx.lineTo(Math.random()*this.width, Math.random()*this.height);
                ctx.stroke();
            }
        }
        let data = ctx.getImageData(0,0,this.width,this.height);
        document.body.removeChild(canvas);
        let tiles = ['plains','swamp','jungle','hills','mountains'];
        for (let x=0; x<this.width; x++) {
            for (let y=0; y<this.height; y++) {
                let v = data.data[(y*this.width+x)*4];
                new Tile(x,y,tiles[Math.floor(v/(256/tiles.length))]);
            }
        }
        let nevil = Math.ceil(Math.random()*3);
        for (let i=0; i<nevil; i++) {
            while (true) {
                let x = Math.floor(Math.random()*this.width/3) + .5;
                let y = Math.floor(Math.random()*(this.height-1)) + .5;
                if ( ! this.spritesOverlapping(x,y,2).filter((x)=>(x.blocksEnemy)).length) {
                    new EvilCity(x,y);
                    this.money += 10;
                    break;
                }
            }
        }
        let ngood = Math.ceil(Math.random()*3);
        for (let i=0; i<ngood; i++) {
            while (true) {
                let x = Math.floor(Math.random()*this.width/3 + 2*this.width/3) - .5;
                let y = Math.floor(Math.random()*(this.height-1)) + .5;
                if ( ! this.spritesOverlapping(x,y,2).filter((x)=>(x.blocksEnemy)).length) {
                    let city = new City(x,y);
                    break;
                }
            }
        }
        while (true) {
            this.recalcTargetting();
            if (this.targettingOK()) break;
            while (true) {
                let x = Math.floor(Math.random()*this.width);
                let y = Math.floor(Math.random()*this.height);
                let tiles = this.spritesOverlapping(x,y,1).filter((x)=>x.blocksEnemy);
                if (tiles.length) {
                    tiles.forEach((x)=>{x.destroy();});
                    new Tile(x,y,'plains');
                    break;
                }
            }
        }
        this.redrawToolbar();
        this.setTickRate();
    }

    redrawToolbar() {
        document.getElementById('money').innerText = '$'+this.money;
        let cities = Object.values(this.sprites).filter((x)=>(x instanceof City));
        let hp = cities.map((c)=>(c.hp.current));
        let lives = hp.reduce((a,b)=>(a+b));
        document.getElementById('lives').innerText = lives+' lives';
    }
    
    recalcTargetting() {
        for (let row of this.targetting) {
            for (let cell of row) {
                cell.dist = Infinity;
                cell.dir = [0,0];
            }
        }
        let toExpand = [];
        for (let city of Object.values(this.sprites).filter((x)=>(x instanceof City))) {
            for (let dx of [-.5, .5]) {
                for (let dy of [-.5, .5]) {
                    this.targetting[city.x+dx][city.y+dy] = {dist: 0, dir:[0,0]};
                    toExpand.push([city.x+dx, city.y+dy]);
                }
            }
        }
        while (toExpand.length) {
            let [x,y] = toExpand.shift();
            for (let [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
                let xn = x+dx;
                let yn = y+dy;
                if (xn<0 || yn<0 || xn>=this.width || yn>=this.height) continue;
                if (this.targetting[xn][yn].dist <= this.targetting[x][y].dist+1) continue;
                this.targetting[xn][yn].dist = this.targetting[x][y].dist + 1;
                this.targetting[xn][yn].dir = [-dx,-dy];
                if (this.spritesOverlapping(xn,yn,1).filter((x)=>(x.blocksEnemy)).length) continue;
                toExpand.push([xn,yn]);
            }
        }
        this.showHideTargetting();
        this.showHideTargetting();
    }

    targettingOK() {
        for (let uid in this.sprites) {
            let sprite = this.sprites[uid];
            if (sprite.img=='evilcity' || sprite.isEnemy) {
                let targ = this.targetting[Math.round(sprite.x)][Math.round(sprite.y)];
                if (targ.dist == Infinity) return false;
            }
        }
        return true;
    }

    showPath(x,y,follow) {
        if (this.spritesOverlapping(x,y,1).filter((x)=>(x.isArrow)).length) return;
        let {dist,dir} = this.targetting[x][y];
        if (dist < Infinity) {
            let [dx,dy] = dir;
            let arrow = new Sprite({x:x, y:y, s:1, z:ZARROW, img:'arrow', theta:Math.atan2(dy,dx)*180/Math.PI});
            arrow.isArrow = true;
            arrow.elem.style.opacity = (follow ? 0.4 : 0.8);
            if (follow) {
                this.showPath(x+dx, y+dy, follow);
            }
        }
    }
    
    showHideTargetting() {
        let arrows = Object.values(this.sprites).filter((x)=>(x.isArrow));
        arrows.forEach((x)=>{x.destroy();});
        if (document.getElementById('dirs').value=='Hide Arrows') {
            document.getElementById('dirs').value='Show Arrows';
            let evil = Object.values(this.sprites).filter((x)=>(x instanceof EvilCity));
            for (let ev of evil) {
                this.showPath(ev.x-.5, ev.y-.5, true);
                this.showPath(ev.x+.5, ev.y-.5, true);
                this.showPath(ev.x-.5, ev.y+.5, true);
                this.showPath(ev.x+.5, ev.y+.5, true);
            }
            return;
        }
        document.getElementById('dirs').value='Hide Arrows';
        for (let x=0; x<this.width; x++) {
            for (let y=0; y<this.height; y++) {
                this.showPath(x,y);
            }
        }
    }
    
    spritesOverlapping(xt,yt,st) {
        let out = {};
        for (let x=Math.round(xt-st/2+.001); x<=Math.round(xt+st/2-.001); x++) {
            for (let y=Math.round(yt-st/2+.001); y<=Math.round(yt+st/2-.001); y++) {
                if (x>=0 && y>=0 && x<this.width && y<this.height) {
                    for (let uid in this.spritesByPlace[x][y]) {
                        out[uid] = this.spritesByPlace[x][y][uid];
                    }
                }
            }
        }
        return Object.values(out);
    }

    async onClick(ev) {
        let box = this.elem.getBoundingClientRect();
        let xr = ((ev.clientX-box.left) / this.r)
        let yr = ((ev.clientY-box.top) / this.r)
        let x = Math.round(xr) - .5;
        let y = Math.round(yr) - .5;
        if (x<0) x=.5;
        if (y<0) y=.5;
        if (x>this.width-1) x=this.width-1.5;
        if (y>this.height-1) y=this.height-1.5;
        let overlap = this.spritesOverlapping(x,y,2);
        if (overlap.filter((x)=>(x.blocksTower)).length) return;
        let pl = new Sprite({x, y, z:ZTOWER, s:2, img:'placeholder'});
        let towers = ['cannon','artillery','howitzer','laser','flamethrower','pusher'];
        towers = towers.map((x)=>({img:x, cost:towerStats[x].cost}));
        let choice = await this.menu(pl, towers);
        pl.destroy();
        if (choice) {
            let tower = new Tower(x,y,choice);
            this.recalcTargetting();
            if (! this.targettingOK() || this.money<0) {
                this.money += tower.cost;
                this.onMoneyChange();
                tower.destroy();
                this.recalcTargetting();
                return;
            }
            let enemies = this.spritesOverlapping(x,y,2).filter((x)=>(x.isEnemy));
            for (let enemy of enemies) {
                while (this.spritesOverlapping(enemy.x,enemy.y,enemy.s).filter((x)=>(x.blocksEnemy)).length) {
                    enemy.x -= enemy.vx;
                    enemy.y -= enemy.vy;
                }
            }
        }
        this.redrawToolbar();
    }

    tickAll() {
        try {
            this.tickCount++;
            this.disableRedraw = (this.tickCount % this.tickSpeed != 0);
            for (let uid in this.sprites) {
                if (this.sprites[uid].onTick) this.sprites[uid].onTick();
            }
        } catch (e) {
            clearInterval(this.ticker);
            throw e;
        }
    }

    setTickRate() {
        clearInterval(this.ticker);
        this.tickSpeed = document.getElementById('slider').value;
        if (this.tickSpeed>0) {
            this.ticker = setInterval(this.tickAll.bind(this), 32/this.tickSpeed);
        }
    }

    async menu(around,opts) {
        if (this.res) this.res();
        this.curmenu = [];
        let p = new Promise((r)=>{this.res=r});
        for (let i=0; i<opts.length; i++) {
            let dx = -1.2 * Math.cos(2*Math.PI*(i/opts.length+.25));
            let dy = -1.2 * Math.sin(2*Math.PI*(i/opts.length+.25));
            let s = new Sprite({x:around.x+dx, y:around.y+dy, z:ZBUTTON, s:0.75, img:opts[i].img});
            s.elem.className+=' button';
            s.elem.addEventListener('click', (ev)=>{ev.stopPropagation();this.res(opts[i].img);});
            s.elem.innerText = opts[i].cost;
            this.curmenu.push(s);
        }
        this.onMoneyChange();
        this.cover = document.createElement('div');
        this.cover.className='cover';
        this.cover.style.zIndex = ZCOVER;
        this.cover.addEventListener('click',(ev)=>{ev.stopPropagation();this.res();});
        this.elem.appendChild(this.cover);
        let choice = await p;
        this.elem.removeChild(this.cover);
        this.curmenu.map((b)=>{b.destroy()});
        delete this.cover;
        delete this.curmenu;
        delete this.res;
        return choice;
    }

    onMoneyChange() {
        if (this.curmenu) {
            for (let btn of this.curmenu) {
                if (this.money < btn.elem.innerText-0) {
                    btn.elem.className+=' disabled';
                } else {
                    btn.elem.className = btn.elem.className.replace('disabled','');
                }
            }
        }
        document.getElementById('money').innerText = '$'+this.money;
    }

}

function getPx(chr) {
    let canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    document.body.appendChild(canvas);
    let ctx = canvas.getContext('2d');
    ctx.font = '90px sans';
    ctx.fillText(chr,0,70);
    let out = ctx.getImageData(0,0,100,100);
    document.body.removeChild(canvas);
    return out;
}
