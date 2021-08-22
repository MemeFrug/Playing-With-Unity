module.exports = class BadGuy1 {
	constructor(x = 0, y = 0, w = 25, h = 25, id, color = "red") {

        //Id for getting multiple in a scene
        this.id = id

		this.x = x;
        this.vx = 0;
		this.y = y;
        this.vy = 0;//Used For Velocity
		this.h = h;
		this.w = w;
        this.speedmax = 1
		this.color = color;

        this.r = 100

        //Attacking
        this.defaulttimeoutintrass = 1000
        this.loseintresstimeout = this.defaulttimeoutintrass

        this.followingid = undefined;
        this.interval;
        this.playersx;
        this.playersy;
        this.damage = 10;
        this.alreadyattacked = false;
        this.attackTimeout = 500//milliseconds
        this.hasattacked = false;

        //adnimation
        this.isdoinganimation = true;
        this.timer = 1000
        

        this.health = 50;

	}

    Reset() {
        this.isdoinganimation = true;
        this.timer = 1000
        this.loseintresstimeout = this.defaulttimeoutintrass

        this.followingid = undefined;
        this.interval = undefined;
        this.playersx = undefined;
        this.playersy = undefined;
        this.speedmax = 1

        this.stop()
        // this.health = 50;
    }

    GoTowardsPlayer(x,y) {
        this.loseintresstimeout -= 1
        if (this.loseintresstimeout <= 0) {
            this.Reset()
            return;
        }

        this.speedmax = 4.1;
        this.playersx = x
        this.playersy = y
        this.isdoinganimation = false;

		this.dx = this.playersx - this.x;
		this.dy = this.playersy - this.y;

		// Using pythagoras' theorm to find the distance (the length of the vector)
		this.l = Math.sqrt(this.dx * this.dx + this.dy * this.dy);

		// Dividing by the distance gives a normalized vector whose length is 1
		this.dx = this.dx / this.l;
		this.dy = this.dy / this.l;

		// Get the enemy to travel towards the player with a new speed of this.speedmax
		this.vx = this.dx * this.speedmax;
		this.vy = this.dy * this.speedmax;
    }

    RectCircleColliding(rect){
        var distX = Math.abs((this.x + this.w / 2) - rect.x-rect.w/2);
        var distY = Math.abs((this.y + this.h / 2 ) - rect.y-rect.h/2);
    
        if (distX > (rect.w/2 + this.r)) { return false; }
        if (distY > (rect.h/2 + this.r)) { return false; }
    
        if (distX <= (rect.w/2)) { return true; } 
        if (distY <= (rect.h/2)) { return true; }
    
        var dx=distX-rect.w/2;
        var dy=distY-rect.h/2;
        return (dx*dx+dy*dy<=(this.r*this.r));
    }    
    
    iscolliding(object) {
        if (this.x < object.x + object.w &&
            this.x + this.w > object.x &&
            this.y < object.y + object.h &&
            this.h + this.y > object.y) {
            return true;
        } else {
            return false;
        }
    }

    collisionDetection(obj) {
        if (this.x + this.w < obj.x ||
            this.x > obj.x + obj.w ||
            this.y + this.h < obj.y ||
            this.y > obj.y + obj.h) {
                return
            }
            this.narrowPhase(obj);
    }

    narrowPhase(obj) {
        let playerTop_ObjBottom = Math.abs(this.y - (obj.y + obj.h));
        let playerRight_ObjLeft = Math.abs((this.x + this.w) - obj.x);
        let playerLeft_ObjRight = Math.abs(this.x - (obj.x + obj.w));
        let playerBottom_ObjTop = Math.abs((this.y + this.h) - obj.y);
    
        if ((this.y <= obj.y + obj.h && this.y + this.h > obj.y + obj.h) && (playerTop_ObjBottom < playerRight_ObjLeft && playerTop_ObjBottom < playerLeft_ObjRight)) {
            this.y = obj.y + obj.h;
            //this.vup = 0;
        }        
        else if ((this.x + this.w >= obj.x && this.x < obj.x) && (playerRight_ObjLeft < playerTop_ObjBottom && playerRight_ObjLeft < playerBottom_ObjTop)) {
            this.x = obj.x - this.w;
            //this.vright = 0; 
        }
        else if ((this.y + this.h >= obj.y && this.y < obj.y) && (playerBottom_ObjTop < playerRight_ObjLeft && playerBottom_ObjTop < playerLeft_ObjRight)) {
            this.y = obj.y - this.h; 
            //this.vdown = 0;
        }
        else if ((this.x <= obj.x + obj.w && this.x + this.w > obj.x + obj.w) && (playerLeft_ObjRight < playerTop_ObjBottom && playerLeft_ObjRight < playerBottom_ObjTop)) {
            this.x = obj.x + obj.w;
            //this.vleft = 0; Add velocities back if clipping through (looks bad but works)
        }
    }
    //-------------

    moveDown() {
        this.vy = this.speedmax
    }

    moveUp() {
        this.vy = -this.speedmax
    }

    moveLeft() {
        this.vx = -this.speedmax
    }

    moveRight() {
        this.vx = this.speedmax
    }

    stop(){
        this.vy = 0;
        this.vx = 0;
    }

    stopVertical() {
        this.vy = 0;
    }
    
    stopHorizontal(){
        this.vx = 0;
    }

    update(deltaTime, WorldSize){
        if (!deltaTime) return;

        this.x += this.vx;
        this.y += this.vy;

        if (this.health > 50) {
            this.health = 50
        }

        if (this.health <= 0) {
            this.health = 50

            this.Reset()
        }

        if (this.x <= 0) {
            this.x = 0
        }
        if (this.x >= WorldSize.w - this.w) {
            this.x = WorldSize.w - this.w
        }
        if (this.y <= 0) {
            this.y = 0
        }
        if (this.y >= WorldSize.h - this.h) {
            this.y = WorldSize.h - this.h
        }

        //Idle Animation and hasattacked variables
        if (this.hasattacked && !this.alreadyattacked) {
            setTimeout(() => {//FIXME: Should probably change this to a variable instead of a setTimeout (Do some research if i should do that)
                this.hasattacked = false;
                this.alreadyattacked = false
            }, this.attackTimeout);
            this.alreadyattacked = true
        }

        if (this.isdoinganimation) {
            this.isdoinganimation = false
            this.timer -= 1
            if (this.timer >= 500) {
                this.moveRight()
            }else if (this.timer > 0 && this.timer < 500){
                this.stopHorizontal()
                this.moveLeft()
            }else if(this.timer <= 0){
                this.stopHorizontal()
                this.timer = 1000
            }
            this.isdoinganimation = true
        }
    }
}
