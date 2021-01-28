let uid = 0;

class Sprite {
    constructor({x, y, z, s, theta, img}) {
        this.x_ = x;
        this.y_ = y;
        this.z = z;
        this.s = s;
        this.theta_ = theta || 0;
        this.img = img;
        this.uid = (uid++);
        this.elem = document.createElement('div');
        this.elem.className = 'sprite';
        this.elem.style.backgroundImage = 'url('+'images/'+img+'.png'+')';
        this.elem.style.zIndex = z;
        board.elem.appendChild(this.elem);
        this.redraw(true);
        board.sprites[this.uid] = this;
        this.lsh();
    }

    get x() { return this.x_; }
    set x(v) { this.unlsh(); this.x_=v; this.redraw(); this.lsh(); return v;}
    get y() { return this.y_; }
    set y(v) { this.unlsh(); this.y_=v; this.redraw(); this.lsh(); return v;}
    get theta() { return this.theta_; }
    set theta(v) { this.theta_=v; this.redraw(); return v;}
    
    redraw(force) {
        if (board.disableRedraw && !force) return;
        this.elem.style.width = (this.s*board.r+1)+'px';
        this.elem.style.height = (this.s*board.r+1)+'px';
        this.elem.style.top = ((this.y-this.s/2+.5)*board.r)+'px';
        this.elem.style.left = ((this.x-this.s/2+.5)*board.r)+'px';
        if (Math.abs(this.theta)<90) { 
            this.elem.style.transform = 'rotate('+this.theta+'deg)';
        } else {
            this.elem.style.transform = 'rotate('+(this.theta)+'deg) scaleY(-1)';
        }
    }

    xlsh(un) {
//        console.log({xmin:Math.round(this.x-this.s/2+.001), xmax:Math.round(this.x+this.s/2-.001), ymin:Math.round(this.y-this.s/2+.001), ymax:Math.round(this.y+this.s/2-.001)});
        for (let x=Math.round(this.x-this.s/2+.001); x<=Math.round(this.x+this.s/2-.001); x++) {
            for (let y=Math.round(this.y-this.s/2+.001); y<=Math.round(this.y+this.s/2-.001); y++) {
//                console.log({x,y});
                if (x>=0 && y>=0 && x<board.width && y<board.height) {
//                    console.log('good');
                    if (un) {
                        delete board.spritesByPlace[x][y][this.uid];
                    } else {
//                        console.log('adding');
                        board.spritesByPlace[x][y][this.uid] = this;
//                        console.log(board.spritesByPlace);
                    }
                }
            }
        }
    }

    lsh() { this.xlsh(false); }
    unlsh() { this.xlsh(true); }
    
    destroy() {
        this.unlsh();
        delete board.sprites[this.uid];
        board.elem.removeChild(this.elem);
    }
}
