const ZLAND = 0;
const ZTOWER = 10;
const ZENEMY = 20;
const ZMARKER = 30;
const ZCOVER = 40;
const ZBUTTON = 50;

class Board {
    constructor(id) {
        this.elem = document.getElementById(id);
        let rect = this.elem.getBoundingClientRect();
        this.width = Math.max(Math.floor(rect.width / 40), 8);
        this.height = Math.max(Math.floor(rect.height / 40), 6);
        this.r = Math.min(rect.width / (this.width+1), rect.height / (this.height+1));
        this.sprites = {};
        this.spritesByPlace = Array(this.width).fill().map(()=>Array(this.height).fill().map(()=>({})));
        this.elem.addEventListener('click', this.onClick.bind(this));

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
        console.log(data);
        let tiles = ['plains','swamp','jungle','hills','mountains'];
        for (let x=0; x<this.width; x++) {
            for (let y=0; y<this.height; y++) {
                let v = data.data[(y*this.width+x)*4];
                new Tile(this,x,y,tiles[Math.floor(v/(256/tiles.length))]);
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
        let xr = (ev.clientX / this.r)
        let yr = (ev.clientY / this.r)
        let x = Math.round(xr) - .5;
        let y = Math.round(yr) - .5;
        if (x<0) x=.5;
        if (y<0) y=.5;
        if (x>this.width-1) x=this.width-1.5;
        if (y>this.height-1) y=this.height-1.5;
        let overlap = this.spritesOverlapping(x,y,2);
        console.log({overlap,sbp:this.spritesByPlace});
        if (overlap.filter((x)=>(x.blocksTower)).length) return;
        let pl = new Sprite(this, x, y, ZMARKER, 2, 0, 'placeholder');
        let towers = ['cannon','artillery','howitzer','laser','flamethrower','pusher'];
        let menu = [];
        let res;
        let p = new Promise((r)=>{res=r});
        for (let i=0; i<6; i++) {
            let dx = -1.2 * Math.cos(Math.PI*(i/3+.5));
            let dy = -1.2 * Math.sin(Math.PI*(i/3+.5));
            let s = new Sprite(this, x+dx, y+dy, ZBUTTON, 0.75, 0, towers[i]);
            s.elem.className+=' button';
            s.elem.addEventListener('click', (ev)=>{ev.stopPropagation();res(towers[i]);});
            menu.push(s);
        }
        this.cover = document.createElement('div');
        this.cover.className='cover';
        this.cover.style.zIndex = ZCOVER;
        this.cover.addEventListener('click',(ev)=>{ev.stopPropagation();res();});
        this.elem.appendChild(this.cover);
        let choice = await p;
        this.elem.removeChild(this.cover);
        for (let s of menu) {
            s.destroy();
        }
        pl.destroy();
        if (choice) {
            new Tower(this, x,y,choice);
        }
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
