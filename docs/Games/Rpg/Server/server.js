const fs = require("fs");

let Data = [{
	username: "admin",
	password: "admin",
	color: "blue",
	isloggedon: 0
},];
// Login Feature
const httpServer2 = require("http").createServer();

fs.readFile("data.txt", "utf8", (err, data) => {
	if (err) {
		console.error(err);
		return;
	}
	Data = JSON.parse(data);
});

const io2 = require("socket.io")(httpServer2, {
	cors: {
		//origin: "http://website.memefrug.me",
		origin: "http://127.0.0.1:3000",
		methods: ["GET", "POST"]
	}
});

const port2 = 8081;

io2.on("connection", (client) => {
	client.on("login", (object) => {
		for (let index = 0; index < Data.length; index++) {
			if (Data[index].username == object.username && Data[index].password == object.password) {
				client.emit("delete");
				console.log("Successfully logged in");
				client.disconnect();
				break;
			} else if (index == Data.length - 1) {
				client.emit("error", "nac");
				client.disconnect();
				break;
			}
		}
		client.disconnect();
	});

	client.on('ping',() => {
		client.emit('pong');
	});

	client.on("signup", (object) => {
		console.log(`${client.id
			} inputed ${object.username
			} and ${object.color
			} and ${object.password
			}`);

		for (let index = 0; index < Data.length; index++) {
			if (Data[index].username == object.username) {
				client.emit("error", "aca");
				client.disconnect();
				break;
			} else if (index == Data.length - 1) {
				Data.push(object);
				fs.writeFile("data.txt", JSON.stringify(Data), {
					flag: "w"
				}, (err) => { });
				console.log("The Data is: ", Data);
				client.emit("delete");
				client.disconnect();
				break;
			}
		}
		client.disconnect();
	});
});

httpServer2.listen(port2);

console.log("Login Server Started on port", port2);


// Game Server


/* TODO: PUT TODOS  HERE
* -
*/


const httpServer = require("http").createServer();

const io = require("socket.io")(httpServer, {
	cors: {
		//origin: "http://website.memefrug.me",
		origin: "http://127.0.0.1:3000",
		methods: ["GET", "POST"]
	}
});

// Requires
const ai = require("./Classes/EnemyAi.js"); // TODO ACTUALLY DO THE AI REFERENCING
const character = require("./Classes/Character.js");
const CubeCreator = require("./Classes/Cube Creator.js");
const Bullet = require("./Classes/Bullet.js")
const { performance } = require("perf_hooks");
const main = require('./Classes/main.js');

//Getting Random Int
function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRndId() {
	//This generates a random string if you get collisions get one more or go to https://gist.github.com/gordonbrander/2230317 to get a duplicate checker
	return Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9)
}

// Declearation of different rooms
let Worlds = [{
	loaded: false,

	Items: [],

	Players: [],

	name: "Default Room 1",

	id: "DEF1",

	maxplayerlimit: 5,

	Bullets: [],

	Size: {
		w: 3000,
		h: 1800,
	},

	StaticObjects: [
		new CubeCreator(100, 100, 50, 50),
		new CubeCreator(700, 300, 50, 50),
		new CubeCreator(700, 400, 50, 50),
	],

	Enemys: [
		new ai(getRndInteger(0, 3000), getRndInteger(0, 1800), 50, 50, getRndId(), "red"),
		new ai(getRndInteger(0, 3000), getRndInteger(0, 1800), 50, 50, getRndId(), "red"),
		new ai(getRndInteger(0, 3000), getRndInteger(0, 1800), 50, 50, getRndId(), "red"),
		new ai(getRndInteger(0, 3000), getRndInteger(0, 1800), 50, 50, getRndId(), "red"),
		new ai(getRndInteger(0, 3000), getRndInteger(0, 1800), 50, 50, getRndId(), "red"),
		new ai(getRndInteger(0, 3000), getRndInteger(0, 1800), 50, 50, getRndId(), "red"),
	],
}];

// Template for adding rooms
function addroom(name, id, maxplayerlimit) {//Add Size, amount of enemys ect
	return {
		
		Items: [],

		loaded: false,

		Players: [],
	
		name: name,
	
		id: id,
	
		maxplayerlimit: maxplayerlimit,
	
		Bullets: [],
	
		Size: {
			w: 3000,
			h: 1800,
		},
	
		StaticObjects: [
			new CubeCreator(100, 100, 50, 50),
			new CubeCreator(700, 300, 50, 50),
			new CubeCreator(700, 400, 50, 50),
		],
	
		Enemys: [
			new ai(getRndInteger(0, 3000), getRndInteger(0, 1800), 50, 50, getRndId(), "red"),
			new ai(getRndInteger(0, 3000), getRndInteger(0, 1800), 50, 50, getRndId(), "red"),
			new ai(getRndInteger(0, 3000), getRndInteger(0, 1800), 50, 50, getRndId(), "red"),
			new ai(getRndInteger(0, 3000), getRndInteger(0, 1800), 50, 50, getRndId(), "red"),
			new ai(getRndInteger(0, 3000), getRndInteger(0, 1800), 50, 50, getRndId(), "red"),
			new ai(getRndInteger(0, 3000), getRndInteger(0, 1800), 50, 50, getRndId(), "red"),
		],
	};
}

// Port for the Game Server
const port = 7979;

function Disconnect(id, room) {//Resets anything that was chasing the player
	for (let index = 0; index < Worlds[room].Enemys.length; index++) {
		if (Worlds[room].Enemys[index].followingid == id) {
			Worlds[room].Enemys[index].Reset()
		}
	}
}

// Used in the Update() Function For getting delta Time
let lastTime = 0;

function UpdateWorld(room, id, type, data) {
	switch (type) {
		case 'Enemy':
			if (data.delete) {
				io.in(id).emit("Update World (Delete Enemy)", data.id)
				return;
			}
			const character = new ai(getRndInteger(0, Worlds[room].Size.w), getRndInteger(0, Worlds[room].Size.h), 50, 50, getRndId(), "red");
			Worlds[room].Enemys.push(character)
			io.in(id).emit("Update World (Enemys)", character.x, character.y, character.w, character.h, character.color, character.id);
			break;
		case 'Static':
			//TODO: There is meant to be a io.in(/*the room*/).emit("Update World (Delete Enemy)", /*the id*/,/*delete all enemys?*/) like above but havent implemented (do it when need to)

			for (let index = 0; index < Worlds[room].StaticObjects.length; index++) {
				let x = Worlds[room].StaticObjects[index].x;
				let y = Worlds[room].StaticObjects[index].y;
				let w = Worlds[room].StaticObjects[index].w;
				let h = Worlds[room].StaticObjects[index].h;
				let c = Worlds[room].StaticObjects[index].c;
				io.in(id).emit("Update World (Static)", x, y, w, h, c);
			}
			break;
		case 'World':
			io.in(id).emit("Update World (Size)", Worlds[room].Size.w, Worlds[room].Size.h);
			break;
	
		default:
			throw new Error('function UpdateWorld() has an error (propably what called it wasent Enemy || Static)');
	}
}

function Update(timeStamp = performance.now()) {
	let deltaTime = timeStamp - lastTime;
	lastTime = timeStamp;

	for (let index = 0; index < Worlds.length; index++) { // For every single room

		for (let i = 0; i < Worlds[index].Bullets.length; i++) {

			Worlds[index].Bullets[i].update(deltaTime)
			let hasbeendeleted = false;

			for (let index3 = 0; index3 < Worlds[index].StaticObjects.length; index3++) {

				if (Worlds[index].Bullets[i].iscolliding(Worlds[index].StaticObjects[index3])) {

					delete Worlds[index].Bullets[i]
					Worlds[index].Bullets.splice(i, 1)
					hasbeendeleted = true;

					break;
				}

			}

			if (hasbeendeleted) continue;

			//Enemy Ai
			for (let index1 = 0; index1 < Worlds[index].Enemys.length; index1++) { // For every enemy in that room

				if (Worlds[index].Bullets[i].iscolliding(Worlds[index].Enemys[index1])) {
					//Then Take Damage
					Worlds[index].Enemys[index1].health -= Worlds[index].Bullets[i].damage

					if (Worlds[index].Enemys[index1].health <= 0) {
						UpdateWorld(index, Worlds[index].id, 'Enemy', {id: Worlds[index].Enemys[index1].id, delete: true})//deletes an character
						UpdateWorld(index, Worlds[index].id, 'Enemy', {delete: false})//adds a new character
						UpdateWorld(index, Worlds[index].id, 'Enemy', {delete: false})//adds a new character
						delete Worlds[index].Enemys[index1]
						Worlds[index].Enemys.splice(index1, 1)
					}

					delete Worlds[index].Bullets[i]
					Worlds[index].Bullets.splice(i, 1)
					hasbeendeleted = true;
					break;
				}

			}

			if (hasbeendeleted) continue;

			for (let index2 = 0; index2 < Worlds[index].Players.length; index2++) {
				if (Worlds[index].Bullets[i].iscolliding(Worlds[index].Players[index2]) && Worlds[index].Players[index2].id != Worlds[index].Bullets[i].id) {
					Worlds[index].Players[index2].health = Worlds[index].Players[index2].health - Worlds[index].Bullets[i].damage
	
					delete Worlds[index].Bullets[i]
					Worlds[index].Bullets.splice(i, 1)
					
					let spawnx
					let spawny

					if (Worlds[index].Players[index2].health <= 0) {
						Worlds[index].Players[index2].health = 100
	
						spawnx = getRndInteger(Worlds[index].Size.w, 0)
						spawny = getRndInteger(Worlds[index].Size.h, 0)

						Worlds[index].Players[index2].x = spawnx
						Worlds[index].Players[index2].y = spawny
					}

					io.in(Worlds[index].id).emit('Update Character', { health: Worlds[index].Players[index2].health, id: Worlds[index].Players[index2].id, x: spawnx, y: spawny});
					hasbeendeleted = true;
					break;
				}
			}

			if (hasbeendeleted) continue;

			if (Worlds[index].Bullets[i].x > Worlds[index].Size.w) {
				delete Worlds[index].Bullets[i]
				Worlds[index].Bullets.splice(i, 1)
				continue;
			}
			else if (Worlds[index].Bullets[i].x < 0) {
				delete Worlds[index].Bullets[i]
				Worlds[index].Bullets.splice(i, 1)
				continue;
			}
			if (Worlds[index].Bullets[i].y > Worlds[index].Size.h) {
				delete Worlds[index].Bullets[i]
				Worlds[index].Bullets.splice(i, 1)
				continue;
			}
			else if (Worlds[index].Bullets[i].y < 0) {
				delete Worlds[index].Bullets[i]
				Worlds[index].Bullets.splice(i, 1)
				continue;
			}
		}

		for (let index1 = 0; index1 < Worlds[index].Enemys.length; index1++) { // For every enemy in that room
			let hasbeendeleted = false;
			Worlds[index].Enemys[index1].update(deltaTime, Worlds[index].Size);

			for (let i = 0; i < Worlds[index].Enemys.length; i++) {
				Worlds[index].Enemys[index1].collisionDetection(Worlds[index].Enemys[i]); // Detects if The Enemy is Colliding with another enemy
			}

			for (let index2 = 0; index2 < Worlds[index].Players.length; index2++) {
				if (Worlds[index].Players[index2].id == Worlds[index].Enemys[index1].followingid) {
					Worlds[index].Enemys[index1].GoTowardsPlayer(Worlds[index].Players[index2].x,Worlds[index].Players[index2].y)
				}
				for (let i = 0; i < Worlds[index].Bullets.length; i++) {
					if (Worlds[index].Enemys[index1].RectCircleColliding(Worlds[index].Bullets[i]) && Worlds[index].Enemys[index1].followingid == undefined) {
						//Then Chase After the player
						Worlds[index].Enemys[index1].followingid = Worlds[index].Bullets[i].id
					}
				}

				if (Worlds[index].Enemys[index1].RectCircleColliding(Worlds[index].Players[index2]) && Worlds[index].Enemys[index1].followingid == undefined) {
					// Chase After Player
					Worlds[index].Enemys[index1].followingid = Worlds[index].Players[index2].id
					Worlds[index].Enemys[index1].loseintresstimeout = Worlds[index].Enemys[index1].defaulttimeoutintrass
				}

				if (Worlds[index].Enemys[index1].iscolliding(Worlds[index].Players[index2]) && !Worlds[index].Enemys[index1].hasattacked) { // if player is colliding with a enemy to therefore take damage.
					//Take Health From Player
					
					Worlds[index].Enemys[index1].hasattacked = true
					Worlds[index].Players[index2].health -= Worlds[index].Enemys[index1].damage
					
					let spawnx
					let spawny

					if (Worlds[index].Players[index2].health <= 0) {//Change its position, and health back to 100
						Worlds[index].Enemys[index1].Reset()
						Worlds[index].Players[index2].health = 100

						spawnx = getRndInteger(Worlds[index].Size.w, 0)
						spawny = getRndInteger(Worlds[index].Size.h, 0)

						Worlds[index].Players[index2].x = spawnx
						Worlds[index].Players[index2].y = spawny
					}

					io.in(Worlds[index].id).emit('Update Character', { health: Worlds[index].Players[index2].health, id: Worlds[index].Players[index2].id, x: spawnx, y: spawny});
				}
			}

			if (hasbeendeleted) continue;
			for (let index2 = 0; index2 < Worlds[index].StaticObjects.length; index2++) { // For Every Object in that room
				Worlds[index].Enemys[index1].collisionDetection(Worlds[index].StaticObjects[index2]); // Detects if The Enemy is Colliding with a object
			}

			io.in(Worlds[index].id).emit("update enemy", {
				id: Worlds[index].Enemys[index1].id,
				x: Worlds[index].Enemys[index1].x,
				y: Worlds[index].Enemys[index1].y,
				health: Worlds[index].Enemys[index1].health
			});
		}

		if (Worlds[index].Players.length <= 0 && Worlds[index].loaded) {
			delete Worlds[index]
			Worlds.splice(index, 1)
			console.log('deleting World with the index:', index);
		}
	}
}

io.on("connection", (client) => {//Game Server
	let username;
	let color;
	///let password;  Once used for logging out the player. (disabled right now)
	let id = client.id;

	let connected = false;

	// ROOM SYSTEM Ima change this to a room by room basis so you can create a room code eg 'E3GI' and if passworded then put password
	let PlayersRoom;//Id of the room
	let PlayersRoomIndex;//Index
	let PlayersIndex;//Index of the player in that room
	// ---------------End of Room System

	client.on("create character", (character, id2) => {
		io.to(id2).emit("createself", character, id);
	});

	client.once("RecieveInfo", (Info) => {
		username = Info.username;
		color = Info.color;
		//password = Info.password;
		hasgotinfo = true;
		console.log('Recieved', username + "'s", 'info');
	})

	client.on('CreateNewRoom', (Data) => {
		for (let index = 0; index < Worlds.length; index++) {
			if (Worlds[index].id == Data.id) {
				console.log('found world that is same id');
				return
			}
		}
		Worlds.push(addroom(Data.name, Data.id, Data.max))
		console.log(`created a world ${Data.name}, id: ${Data.id}`);

		client.emit("RecieveRoomIndex", Data.id ,Worlds.length - 1)

	})

	// client.on('dropitem', (item) => {
	// 	console.log('dropping item');
	// 	console.log(item);
	// 	client.broadcast.to(PlayersRoom).emit('Add_Gun', item)
	// })

	// client.on('pickupitem', (item) => {

	// })

	client.on("UpdateServerList", () => {
		for (let index = 0; index < Worlds.length; index++) {
			client.emit("GetServerInfo", {isserver: true, id: Worlds[index].id, index: index, players: {max: Worlds[index].maxplayerlimit, in: Worlds[index].Players.length}, name: Worlds[index].name})
		}
		if (Worlds.length == 0) client.emit("GetServerInfo", {isserver: false});
	})

	client.on("Join Game", (Info) => {
		connected = true;

		//Joins a room
		PlayersRoomIndex = Info.index;

		if (Worlds[PlayersRoomIndex].Players.length >= Worlds[PlayersRoomIndex].maxplayerlimit) {
			client.emit('CantJoin', {Reason: "That world has reach max players"})
			console.log("Max Player Cant Join");
			return;
		}

		console.log("Can Join");

		client.emit('Can Join')
		

		client.join(Info.id);
		PlayersRoom = Info.id
		console.log(username, "has connected to World " + PlayersRoomIndex);

		Worlds[PlayersRoomIndex].Players.push(new character(Info.x, Info.y, color, username, id, 'swordsman', 100));

		PlayersIndex = Worlds[PlayersRoomIndex].Players.length - 1;

		console.log('Players Index;',PlayersIndex, 'Players connected;', Worlds[PlayersRoomIndex].Players.length, ' - 1');

		//Dunnno if this does anything
		// if (Worlds[PlayersRoomIndex].players > 1) {
		// 	client.broadcast.to(PlayersRoom).emit("Create Character", character);
		// }

		console.log(`${username} joined`);//Logs in console the username of which whom joined

		client.broadcast.to(PlayersRoom).emit("createcharacter", {
			username: username,
			id: id,
			color: color,
			x: Info.x,
			y: Info.y
		});

		for (let index = 0; index < Worlds[PlayersRoomIndex].StaticObjects.length; index++) {
			let x = Worlds[PlayersRoomIndex].StaticObjects[index].x;
			let y = Worlds[PlayersRoomIndex].StaticObjects[index].y;
			let w = Worlds[PlayersRoomIndex].StaticObjects[index].w;
			let h = Worlds[PlayersRoomIndex].StaticObjects[index].h;
			let c = Worlds[PlayersRoomIndex].StaticObjects[index].c;
			client.emit("Update World (Static)", x, y, w, h, c);
		}
		
		for (let index = 0; index < Worlds[PlayersRoomIndex].Enemys.length; index++) {
			let x = Worlds[PlayersRoomIndex].Enemys[index].x;
			let y = Worlds[PlayersRoomIndex].Enemys[index].y;
			let w = Worlds[PlayersRoomIndex].Enemys[index].w;
			let h = Worlds[PlayersRoomIndex].Enemys[index].h;
			let c = Worlds[PlayersRoomIndex].Enemys[index].color;
			let id = Worlds[PlayersRoomIndex].Enemys[index].id;
			client.emit("Update World (Enemys)", x, y, w, h, c, id);
		}

		client.emit("Update World (Size)", Worlds[PlayersRoomIndex].Size.w, Worlds[PlayersRoomIndex].Size.h);
		console.log(Worlds[PlayersRoomIndex].Players.length, 'connected to World', PlayersRoomIndex)
		Worlds[PlayersRoomIndex].loaded = true;
	});

	// Update Characater
	client.on("updatecharacter", (x, y, health) => {
		if (!connected) {return;}
		client.broadcast.to(PlayersRoom).emit("update character", {
			id: id, // to specifie our character
			x: x,
			y: y,
			health: health
		});

		//FIXME: This produces an error when someone leaves probably because of the disconnection and imporpper character position
		try {
			Worlds[PlayersRoomIndex].Players[PlayersIndex].x = x;
			Worlds[PlayersRoomIndex].Players[PlayersIndex].y = y;
		} catch (error) {
			PlayersIndex -= 1
			console.log('Someone disconnected changing index. My index:', Worlds[PlayersRoomIndex].Players[PlayersIndex], 'My reference index:', PlayersIndex);
		}
	});

	client.on('New Bullet', (bullet) => {
		Worlds[PlayersRoomIndex].Bullets.push(new Bullet(bullet.x, bullet.y, bullet.Mouse.x, bullet.Mouse.y, id))
		client.broadcast.to(PlayersRoom).emit('new bullet', bullet.x, bullet.y, bullet.Mouse.x, bullet.Mouse.y, id)
	})

	client.once("disconnect", () => {//FIXME: I think there is a problem with the disconnect function and is causing an bug
		if (connected) {
			client.disconnect()
			connected = false;
			Disconnect(id, PlayersRoomIndex);
			console.log(`${username} disconnected`);

			client.broadcast.to(PlayersRoom).emit("Delete Character", id);
			console.log(client.id, "has disconnected");
			Worlds[PlayersRoomIndex].Players.splice(PlayersIndex, 1);

			console.log('Players Index;',PlayersIndex, 'Players connected;', Worlds[PlayersRoomIndex].Players.length, ' - 1 to ',PlayersRoom);
		}
	});

	//----------Ping Pong system for checking if server online and or latency (ping)
	client.on('ping',() => {
		client.emit('pong');
	});
});

httpServer.listen(port);

setInterval(Update, 16.7)

console.log("Main Server Started on port", port);
