module.exports = class Character {
    constructor(x = 0,y = 0,color = 'blue',username = '', id, type = 'swordsman', health) {
        this.x = x
        this.y = y

        this.health = health;

        this.w = 25
        this.h= 25

        //Personal
        this.color = color
        this.type = type
        this.username = username
        this.id = id
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
}