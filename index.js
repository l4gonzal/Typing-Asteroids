const FPS = 30;
const FRICTION = 0.7; //frictino coeff of space (0 to 1)
const PLAYER_SIZE = 30; //player pixel height
const TURN_SPEED = 360; //degrees per second
const PLAYER_THRUST = 5; //acceleration p/sec
const LINE_THICKNESS = 1.5;
/**@type {HTMLCanvasElement} */
var canv = document.getElementById("gameCanvas");
var ctx = canv.getContext("2d");

var player = {
    x: canv.width / 2,
    y: canv.height / 2,
    r: PLAYER_SIZE / 2,
    a: 90 / 180 * Math.PI, //angle in radians
    rot: 0,
    thrusting: false,
    thrust: {
        x: 0,
        y: 0
    }
}

//Event Handling
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

setInterval(update, 1000 / FPS);

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
    //draw bg
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);

    //ship thrust
    if (player.thrusting) {
        player.thrust.x += PLAYER_THRUST * Math.cos(player.a) / FPS;
        player.thrust.y -= PLAYER_THRUST * Math.sin(player.a) / FPS;
        //draw thrust
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
    else {
        player.thrust.x -= FRICTION * player.thrust.x / FPS;
        player.thrust.y -= FRICTION * player.thrust.y / FPS;
    }

    //draw player
    ctx.strokeStyle = "white";
    ctx.lineWidth = LINE_THICKNESS;
    ctx.beginPath();
    ctx.moveTo(
        player.x + player.r * Math.cos(player.a),
        player.y - player.r * Math.sin(player.a)
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

    //player rotation
    player.a += player.rot;

    //player movement
    player.x += player.thrust.x;
    player.y += player.thrust.y;

    //offscreen
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

    //center dot
    ctx.fillStyle = "red";
    ctx.fillRect(player.x - 2, player.y - 2, 4, 4);
}