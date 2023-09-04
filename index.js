import { wordList } from "./wordList.js";

const FPS = 30;
const FRICTION = 0.7; //frictino coeff of space (0 to 1)
const PLAYER_SIZE = 30; //player pixel height
const TURN_SPEED = 360; //degrees per second
const PLAYER_THRUST = 5; //acceleration p/sec
const PLAYER_DEATH_DUR = 0.3; //duration until player respawn
const PLAYER_INVUL_DUR = 3; //duration of invulnerability
const PLAYER_BLINK_DUR = 0.1; //flashing during invuln mode
const LINE_THICKNESS = 1.5;
const ASTEROID_NUM = 3; //starting asteroid num
const ASTEROID_SIZE = 100; //max size
const ASTEROID_MIN_SIZE = 10; //min size
const ASTEROID_SPEED = 60; //max speed
const ASTEROID_VERT = 10; //average num of verticies
const ASTEROID_JAG = 0.3; //asteroid jaggedness (0 to 1)

//flags
const SHOW_PLAYER_CENTER = false;
const SHOW_BOUNDING = false; //for collision

/**@type {HTMLCanvasElement} */
var canv = document.getElementById("gameCanvas");
var ctx = canv.getContext("2d");

var player = newPlayer();

var asteroids = [];
createAsteroidBelt();

//Event Handling
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

setInterval(update, 1000 / FPS);

function createAsteroidBelt() {
    asteroids = [];
    for (var i = 0; i < ASTEROID_NUM; i++) {
        do {
            var x, y, r;
            x = Math.floor(Math.random() * canv.width);
            y = Math.floor(Math.random() * canv.height);
            r = ASTEROID_SIZE;
        } while (distBetweenPoints(player.x, player.y, x, y) < ASTEROID_SIZE * 2 + player.r);
        asteroids.push(newAsteroid(x, y, r));
    }
}

function newAsteroid(x, y, r) {
    var asteroid = {
        x: x,
        y: y,
        r: r / 2,
        xv: Math.random() * ASTEROID_SPEED / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ASTEROID_SPEED / FPS * (Math.random() < 0.5 ? 1 : -1),
        a: Math.random() * Math.PI * 2, //radian
        vert: Math.floor(Math.random() * (ASTEROID_VERT + 1) + ASTEROID_VERT / 2),
        offs: [],
        word: {
            text: randWord(),
            untypedCharIdx: 0
        }
    }
    //create vertex offsets
    for (var i = 0; i < asteroid.vert; i++) {
        asteroid.offs.push(Math.random() * ASTEROID_JAG * 2 + 1 - ASTEROID_JAG);
    }
    return asteroid;
}

function destroyAsteroid(ast) {
    console.log(asteroids);
    var x, y, r, idx;
    x = ast.x;
    y = ast.y;
    r = ast.r;

    idx = asteroids.indexOf(ast);
    if (idx !== -1) {
        asteroids.splice(idx, 1);
    }
    console.log(asteroids);
    console.log(r, r / 2);
    if (r / 2 > ASTEROID_MIN_SIZE) {
        for (var i = 0; i < 3; i++) {

            asteroids.push(newAsteroid(x, y, r));
        }
    }
}

function randWord() {
    var randIdx = Math.floor(Math.random() * wordList.length);
    return wordList[randIdx];
}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function playerDeath() {
    if (SHOW_BOUNDING) {
        ctx.fillStyle = "lime";
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2, false);
        ctx.stroke();
        ctx.fill();
    }
    player.deathDur = Math.ceil(PLAYER_DEATH_DUR * FPS);
}

function newPlayer() {
    return {
        x: canv.width / 2,
        y: canv.height / 2,
        r: PLAYER_SIZE / 2,
        a: 90 / 180 * Math.PI, //angle in radians
        rot: 0,
        thrusting: false,
        thrust: {
            x: 0,
            y: 0
        },
        deathDur: 0,
        blinkNum: Math.ceil(PLAYER_INVUL_DUR / PLAYER_BLINK_DUR),
        blinkDur: Math.ceil(PLAYER_BLINK_DUR * FPS)

    }
}

function keyDown(/** @type {KeyboardEvent} */ ev) {
    switch (ev.code) {
        case 'ArrowLeft':
            player.rot = TURN_SPEED / 180 * Math.PI / FPS;
            break;
        case 'ArrowRight':
            player.rot = -TURN_SPEED / 180 * Math.PI / FPS;
            break;
        case 'ArrowUp':
            player.thrusting = true;
            break;

    }
    if (ev.code.length > 3 && ev.code.slice(0, 3) == "Key") {
        var char = ev.code.slice(3);
    }

}

function keyUp(/** @type {KeyboardEvent} */ ev) {
    switch (ev.code) {
        case 'ArrowLeft':
            player.rot = 0;
            break;
        case 'ArrowRight':
            player.rot = 0;
            break;
        case 'ArrowUp':
            player.thrusting = false;
            break;
    }
}

function update() {
    var blinkOn = player.blinkNum % 2 == 0;
    var isPlayerDead = player.deathDur > 0;
    //draw bg
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);

    //ship thrust
    if (player.thrusting) {
        player.thrust.x += PLAYER_THRUST * Math.cos(player.a) / FPS;
        player.thrust.y -= PLAYER_THRUST * Math.sin(player.a) / FPS;
        //draw thrust
        if (!isPlayerDead) {
            ctx.fillStyle = "gray";
            ctx.strokeStyle = "white";
            ctx.lineWidth = LINE_THICKNESS * 1.1;
            ctx.beginPath();
            ctx.moveTo(
                player.x - player.r * (Math.cos(player.a) + 0.5 * Math.sin(player.a)),
                player.y + player.r * (Math.sin(player.a) - 0.5 * Math.cos(player.a))
            )
            ctx.lineTo(
                player.x - player.r * 2 * Math.cos(player.a),
                player.y + player.r * 2 * Math.sin(player.a)
            )
            ctx.lineTo(
                player.x - player.r * (Math.cos(player.a) - 0.5 * Math.sin(player.a)),
                player.y + player.r * (Math.sin(player.a) + 0.5 * Math.cos(player.a))
            )
            ctx.closePath()
            ctx.fill();
            ctx.stroke();
        }
    }
    else {
        player.thrust.x -= FRICTION * player.thrust.x / FPS;
        player.thrust.y -= FRICTION * player.thrust.y / FPS;
    }

    //draw player
    if (!isPlayerDead) {
        if (blinkOn) {
            ctx.strokeStyle = "white";
            ctx.lineWidth = LINE_THICKNESS;
            ctx.beginPath();
            ctx.moveTo(
                player.x + 4 / 3 * player.r * Math.cos(player.a),
                player.y - 4 / 3 * player.r * Math.sin(player.a)
            );
            ctx.lineTo( //left line
                player.x - player.r * (Math.cos(player.a) + Math.sin(player.a)),
                player.y + player.r * (Math.sin(player.a) - Math.cos(player.a))
            );
            ctx.lineTo( //right line
                player.x - player.r * (Math.cos(player.a) - Math.sin(player.a)),
                player.y + player.r * (Math.sin(player.a) + Math.cos(player.a))
            );
            ctx.closePath();
            ctx.stroke();
        }

        //handle flashing
        if (player.blinkNum > 0) {
            player.blinkDur--;
            if (player.blinkDur == 0) {
                player.blinkDur = Math.ceil(PLAYER_BLINK_DUR * FPS);
                player.blinkNum--;
            }
        }
    } else {
        ctx.fillStyle = "dimgray";
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.r * 1.5, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "gray";
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.r * 1.2, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "darkgray";
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.r * 0.8, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "lightgray";
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.r * 0.4, 0, Math.PI * 2, false);
        ctx.fill();
    }

    if (SHOW_BOUNDING) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2, false);
        ctx.stroke();
    }

    //draw asteroids
    var x, y, r, a, vert, offs, word;
    for (var i = 0; i < asteroids.length; i++) {
        x = asteroids[i].x;
        y = asteroids[i].y;
        r = asteroids[i].r;
        a = asteroids[i].a;
        vert = asteroids[i].vert;
        offs = asteroids[i].offs;
        word = asteroids[i].word;

        //draw path
        ctx.strokeStyle = "slategrey"
        ctx.lineWidth = LINE_THICKNESS * 1.2;
        ctx.beginPath();
        ctx.moveTo(
            x + r * offs[0] * Math.cos(a),
            y + r * offs[0] * Math.sin(a)
        );

        //draw polygon
        for (var j = 1; j < vert; j++) {
            ctx.lineTo(
                x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert),
            );
        }
        ctx.closePath();
        ctx.stroke();

        //draw word
        ctx.strokeStyle = "slategrey"
        ctx.font = "25px Lucida Console";
        ctx.strokeText(word.text, x, y - r * 1.3);

        if (SHOW_BOUNDING) {
            ctx.strokeStyle = "lime";
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, false);
            ctx.stroke();
        }
    }

    if (SHOW_PLAYER_CENTER) {
        ctx.fillStyle = "red";
        ctx.fillRect(player.x - 2, player.y - 2, 4, 4);
    }

    if (!isPlayerDead) {
        if (player.blinkNum == 0) {
            //check for collision
            for (var i = 0; i < asteroids.length; i++) {
                if (distBetweenPoints(player.x, player.y, asteroids[i].x, asteroids[i].y) < player.r + asteroids[i].r) {
                    playerDeath();
                    destroyAsteroid(asteroids[i]);
                }
            }
        }

        //player rotation
        player.a += player.rot;

        //player movement
        player.x += player.thrust.x;
        player.y += player.thrust.y;
    } else {
        player.deathDur--;
        if (player.deathDur <= 0) {
            player = newPlayer();
        }
    }

    //player offscreen
    if (player.x < 0 - player.r) {
        player.x = canv.width + player.r;
    }
    else if (player.x > canv.width + player.r) {
        player.x = 0 - player.r;
    }
    if (player.y < 0 - player.r) {
        player.y = canv.height + player.r;
    }
    else if (player.y > canv.height + player.r) {
        player.y = 0 - player.r;
    }

    //move asteroids
    for (var i = 0; i < asteroids.length; i++) {
        asteroids[i].x += asteroids[i].xv;
        asteroids[i].y += asteroids[i].yv;

        //asteroid offscreen
        if (asteroids[i].x < 0 - asteroids[i].r) {
            asteroids[i].x = canv.width - asteroids[i].r;
        } else if (asteroids[i].x > canv.width + asteroids[i].r) {
            asteroids[i].x = 0 - asteroids[i].r;
        }
        if (asteroids[i].y < 0 - asteroids[i].r) {
            asteroids[i].y = canv.height - asteroids[i].r;
        } else if (asteroids[i].y > canv.height + asteroids[i].r) {
            asteroids[i].y = 0 - asteroids[i].r;
        }
    }
}