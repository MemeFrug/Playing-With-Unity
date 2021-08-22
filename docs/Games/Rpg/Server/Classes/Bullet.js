module.exports = class Bullet {
	constructor(x, y, mouseX, mouseY, id) {

		this.speed = 8

		this.damage = 5;

		this.dx = 0;
		this.dy = 0;

		// The mouse pos - the player pos gives a vector
		// that points from the player toward the mouse
		this.vx = mouseX - x;
		this.vy = mouseY - y;

		// Using pythagoras' theorm to find the distance (the length of the vector)
		this.l = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

		// Dividing by the distance gives a normalized vector whose length is 1
		this.vx = this.vx / this.l;
		this.vy = this.vy / this.l;

		// Reset bullet position
		this.x = x;
		this.y = y;

		// Get the bullet to travel towards the mouse pos with a new speed of 10.0 (you can change this)
		this.dx = this.vx * this.speed;
		this.dy = this.vy * this.speed;

		this.id = id;

		this.w = 7
		this.h = 7
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

	update(deltaTime) {
		if (!deltaTime) return;
		
		this.x += this.dx;
		this.y += this.dy;
	}
}
