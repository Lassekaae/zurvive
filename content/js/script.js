////////////////////////////////GENERAL////////////////////////////////
//Defining the canvas.
var canvas = $("canvas")[0];
var ctx = canvas.getContext("2d");

//Disabling the right-click menu.
document.addEventListener('contextmenu', event => event.preventDefault());

//Deltatime.
var deltaTime = 0;
var lastCalledTime;

//Mouse.
var mouse = { x: 0, y: 0 };

//Keyboard-keys.
var keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

//Game info
var game = {
    paused: false,
    night: false,
    time: 0
};

var autoShoot = false;

//Bullet array
var bullets = [];

//mob array
var mobs = [];
var cuedMobs = [];

////////////////////////////////VARIABLES////////////////////////////////
//Canvas / Map-size.
var map = {
    width: 3000,
    height: 1800,
    //Static map
    //width: window.innerWidth,
    //height: window.innerHeight
};
canvas.width = map.width;
canvas.height = map.height;
canvas.x;
canvas.y;

//Me.
var me = {
    x: map.width / 2,
    y: map.height / 2,
    color: "orange",
    size: 80,
    speed: 8,
    hpMax: 50,
    flashlight: false,
    flashlightDist: 2000,
    money: 0,
    bleeding: false,
    healAfter: 5, //Sec before i start to regenerate hp.
    weapon1: "assultRifle",
    weapon2: "pistol",
    pistolAmmo: 400,
    ARAmmo: 12000
};
me.hp = me.hpMax;
me.weapon = me.weapon1;

//Enemies.
var mobInf = {
    color: "red",
    size: 80,
    speed: 400,
    dmg: 10,
    hp: 20,
    attackSpeed: 1 //Time between attacks.
};

//Waves.
var waves = {
    start: 5, //Time before the first wave.
    next: 5, // Time inbetween waves.
    time: 20, //Minimum time of a wave.
    ammount: 10, //Number of mobs that spawn.
    max: 10, //Maximum mobs pr. wave.
    incoming: true, //Is a wave currently on the way.
    level: 1
};
waves.rate = waves.time / waves.ammount;

////////////////////////////////WEAPONS////////////////////////////////
var justShot = false;
function pistol() {
    if (justShot == false) {
        if (me.pistolAmmo > 0) {
            me.pistolAmmo = me.pistolAmmo - 1;
            //Sound
            let audio = new Audio();
            audio.src = "content/mp3/bullet.mp3";
            audio.volume = 0.2;
            audio.play();

            //Functionality
            let bullet = {};
            bullet.x = me.x;
            bullet.y = me.y;
            bullet.dmg = 10;
            bullet.speedX = Math.cos((me.deg + 90) / 180 * Math.PI) * 2000;
            bullet.speedY = Math.sin((me.deg + 90) / 180 * Math.PI) * 2000;
            bullet.deg = me.deg;
            bullets.push(bullet);

            justShot = true;
            setTimeout(function () {
                justShot = false;
            }, 400);
        }
    }
}
function assultRifle() {
    if (me.ARAmmo > 0) {
        me.ARAmmo = me.ARAmmo - 1;
        //Sound
        let audio = new Audio();
        audio.src = "content/mp3/bullet.mp3";
        audio.volume = 0.3;
        audio.play();

        //Functionality
        let bullet = {};
        bullet.x = me.x;
        bullet.y = me.y;
        bullet.dmg = 15;
        bullet.speedX = Math.cos((me.deg + 90) / 180 * Math.PI) * 3000;
        bullet.speedY = Math.sin((me.deg + 90) / 180 * Math.PI) * 3000;
        bullet.deg = me.deg;
        bullets.push(bullet);

        if (autoShoot == false) {
            autoShoot = true;
            autoShoot = setInterval(assultRifle, 2000 - 1900);
        }
    }
}

////////////////////////////////FUNCTIONS////////////////////////////////
//When a keyboard-key is pressed.
$(window).on("keydown", function (e) {
    switch (e.keyCode) {
        case 87:
            keys.w = true;
            keys.s = false;
            break;
        case 65:
            keys.a = true;
            keys.d = false;
            break;
        case 83:
            keys.s = true;
            keys.w = false;
            break;
        case 68:
            keys.d = true;
            keys.a = false;
            break;
        case 49: // [1] - change weapon.
            me.weapon = me.weapon1;
            clearInterval(autoShoot);
            autoShoot = false;
            break;
        case 50: // [2] - change weapon.
            if (me.weapon2) me.weapon = me.weapon2;
            clearInterval(autoShoot);
            autoShoot = false;
            break;
        case 70: // [f] - turn on flashlight.
            let audio = new Audio(); //Sound of flashlight.
            audio.src = "content/mp3/switch.mp3";
            audio.volume = 0.5;
            audio.play();
            me.flashlight = !me.flashlight; //Turn on flashlight.
            break;
        case 78: // [n] - make it night.
            game.night = !game.night;
            break;
        case 80: // [p] - pause.
            game.paused = !game.paused;
            break;
        case 82: // [r] - reload.
            location.reload();
            break;
    };
});

//When a keyboard-key is released.
$(window).on("keyup", function (e) {
    switch (e.keyCode) {
        case 87:
            keys.w = false;
            break;
        case 65:
            keys.a = false;
            break;
        case 83:
            keys.s = false;
            break;
        case 68:
            keys.d = false;
            break;
    };
});

//When the mouse moves.
$(canvas).on("mousemove", function (e) {
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
});

//When the mouse clicks.
$(canvas).on("mousedown", function (e) {
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
    if (e.which == 1) { //Checks if the click is a left-click.
        if (game.paused == false) window[me.weapon](e);
    };
    if (e.which == 2) { //Checks if the click is a middle-click.
    }
    if (e.which == 3) { //Checks if the click is a left-click.
    };
});

//mouseup & mouseleave.
$(canvas).on("mouseup mouseleave", function () {
    clearInterval(autoShoot);
    autoShoot = false;
});

//Deal damage.
var bleed;
function dealDamage(from, to) {
    to.hp = to.hp - from.dmg;

    if (bleed) {
        clearTimeout(bleed);
    }

    me.bleeding = true;
    bleed = setTimeout(function () {
        me.bleeding = false;
    }, me.healAfter * 1000);

    if (me.hp <= 0) location.reload();
}

//Healing
setInterval(function () {
    //Pause
    if (document.hidden) {
        game.paused = true;
    }
    //Heal
    if (game.paused == false && me.bleeding == false && me.hp < me.hpMax) {
        me.hp = me.hp + 1;
        console.log(me.hp);
    }
}, 100);

//Start waves.
setTimeout(function () { startWave() }, waves.start * 1000); //Start the first wave.
function startWave() {
    waves.incoming = false;

    for (let i = 0; i < waves.ammount; i++) {

        let mob = { dmg: mobInf.dmg, color: mobInf.color, size: mobInf.size, hp: mobInf.hp, speed: mobInf.speed, lastHit: 0 };
        mob.spawnTime = game.time + waves.rate * (i + 1);

        let random = Math.random();
        let randX = Math.floor(Math.random() * map.width);
        let randY = Math.floor(Math.random() * map.height);

        if (random <= 0.5) {
            if (randX > (map.width / 2)) randX = map.width + mob.size;
            if (randX < (map.width / 2)) randX = 0 - mob.size;
        }
        else {
            if (randY > (map.height / 2)) randY = map.height + mob.size;
            if (randY < (map.height / 2)) randY = 0 - mob.size;
        }

        mob.x = randX;
        mob.y = randY;

        cuedMobs.push(mob);
    };

    waves.ammount = waves.ammount + waves.level;
    mobInf.hp = mobInf.hp + 4;
    waves.rate = waves.time / waves.ammount;

};

//Time game has been active.
setInterval(function () {
    if (game.paused == false) {
        game.time++;
    }

    if (mobs.length >= waves.max) {
        for (let i = 0; i < cuedMobs.length; i++) {
            let mob = cuedMobs[i];
            mob.spawnTime = mob.spawnTime + waves.rate;
        }
    }

    //console.log(game.time);
}, 1000);

//Calculate angle between a and b.
function CalcAngleAB(a, b) {
    let angleDeg = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    return angleDeg;
}

//Calculate distance from circle to circle.
function distCircleAB(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)) - a.size - b.size;
};

//Calculate deltatime (last time a frameupdate was requested).
function setDeltaTime() {
    if (!lastCalledTime) {
        lastCalledTime = new Date().getTime();
        return;
    }
    deltaTime = (new Date().getTime() - lastCalledTime) / 1000;
    lastCalledTime = new Date().getTime();
};

////////////////////////////////HANDLER////////////////////////////////
requestAnimationFrame(handler);
function handler() {
    //Calculate deltatime.
    setDeltaTime();

    //Only run handler if game is not paused.
    if (game.paused == false) {
        //Handle spawning.
        for (let i = 0; i < cuedMobs.length; i++) {
            let mob = cuedMobs[i];
            if (mob.spawnTime <= game.time && mobs.length < waves.max) {
                cuedMobs.splice(i, 1);
                mobs.push(mob);
            }
        };
        if (mobs.length <= 0 && cuedMobs.length <= 0 && game.time > waves.start && waves.incoming == false) {
            console.log("Next Wave");
            waves.incoming = true;
            setTimeout(function () {
                waves.level = waves.level + 1;
                startWave();
            }, waves.next * 1000);
        };

        //Handle my movement.
        let speed = me.speed;

        if (keys.w == true && me.y > 0 + me.size) {
            if (keys.a == true || keys.d == true) speed = speed * 0.7071;
            me.y = me.y - speed; mouse.y = mouse.y - speed;
            speed = me.speed;
        };
        if (keys.a == true && me.x > 0 + me.size) {
            if (keys.w == true || keys.s == true) speed = speed * 0.7071;
            me.x = me.x - speed; mouse.x = mouse.x - speed;
            speed = me.speed;
        };
        if (keys.s == true && me.y < map.height - me.size) {
            if (keys.a == true || keys.d == true) speed = speed * 0.7071;
            me.y = me.y + speed; mouse.y = mouse.y + speed;
            speed = me.speed;
        };
        if (keys.d == true && me.x < map.width - me.size) {
            if (keys.w == true || keys.s == true) speed = speed * 0.7071;
            me.x = me.x + speed; mouse.x = mouse.x + speed;
            speed = me.speed;
        };

        //Handle canvas position and move it.
        canvas.x = (0.5 * window.innerWidth) - me.x //Position camera with me in the middle;
        canvas.y = (0.5 * window.innerHeight) - me.y;
        if (canvas.x >= 0) canvas.x = 0; //Check if i have reached any of the 4 edges.
        if (canvas.y >= 0) canvas.y = 0;
        if (canvas.x <= window.innerWidth - map.width) canvas.x = window.innerWidth - map.width;
        if (canvas.y <= window.innerHeight - map.height) canvas.y = window.innerHeight - map.height;
        if (map.width < innerWidth) canvas.x = 0; //Check if map is smaller than view-size.
        if (map.height < innerHeight) canvas.y = 0;
        canvas.style.left = canvas.x + "px"; //Moving the canvas relative to my position.
        canvas.style.top = canvas.y + "px";

        //Handle bullet movement.
        for (let i = 0; i < bullets.length; i++) {
            //Make it move.
            let bullet = bullets[i];
            bullet.x = bullet.x + bullet.speedX * deltaTime;
            bullet.y = bullet.y + bullet.speedY * deltaTime;

            //Check for border-collision.
            if (bullet.x <= 0 || bullet.y <= 0 || bullet.x >= map.width || bullet.y >= map.height) bullets.splice(i, 1);

            //Check for unit-collision.
            for (let n = 0; n < mobs.length; n++) {
                let mob = mobs[n];
                let distToMob = Math.sqrt(Math.pow(bullet.y - mob.y, 2) + Math.pow(bullet.x - mob.x, 2));
                if (distToMob <= mob.size) {
                    bullets.splice(i, 1);
                    if (mob.hp >= bullet.dmg) me.money = me.money + bullet.dmg;
                    if (mob.hp < bullet.dmg) me.money = me.money + mob.hp;
                    mob.hp = mob.hp - bullet.dmg;
                };
                if (mob.hp <= 0) mobs.splice(n, 1);
            };
        };

        //Handle mob-movement.
        for (let i = 0; i < mobs.length; i++) {
            let mob = mobs[i];
            let angle = CalcAngleAB(mob, me);
            mob.speedX = Math.cos(angle / 180 * Math.PI) * mob.speed;
            mob.speedY = Math.sin(angle / 180 * Math.PI) * mob.speed;
            mob.x = mob.x + mob.speedX * deltaTime;
            mob.y = mob.y + mob.speedY * deltaTime;

            //Check for collision with me.
            if (distCircleAB(mob, me) <= 0) {
                //mobs.splice(i, 1);
                if (mob.lastHit + mobInf.attackSpeed * 1000 <= Date.now()) console.log("hit"), dealDamage(mob, me), mob.lastHit = Date.now();;
            };
        };
    };

    //Draw and run code again.
    render();
    requestAnimationFrame(handler);
};

////////////////////////////////RENDER////////////////////////////////
function render() {
    //Clearing the canvas.
    canvas.width = canvas.width;

    //Draw border at the edge of the map.
    drawEdge(0, 0, 0, "edge", 0.9);

    //Drawing all bullets.
    for (let i = 0; i < bullets.length; i++) {
        let bullet = bullets[i];
        drawBullet(bullet);
    }

    //Drawing all mobs.
    for (let i = 0; i < mobs.length; i++) {
        let mob = mobs[i];
        drawUnit(mob, me);
    }

    //Drawing the player.
    drawUnit(me, mouse);

    //Darken the map.
    if (game.night == false) drawDarkness(0.05);
    if (game.night == true) drawDarkness(0.99);

    let hpPct = 1 - (me.hp / me.hpMax);
    drawEdge(270, 27, 27, "view", 0.6 * hpPct);

    //Draw UI.
    drawWaveLevel(); //Wave level.
    drawMoney(); //Draw money.

    if (game.paused) drawPause();
};

////////////////////////////////DRAWINGS////////////////////////////////
//Draw a circular unit.
function drawUnit(who, looking) {
    //Finds out what what the unit is looking.
    if (game.paused == false) who.deg = CalcAngleAB(who, looking) - 90;

    ctx.translate(who.x, who.y); //Rotate the unit.
    ctx.rotate(who.deg * Math.PI / 180);
    ctx.translate(-(who.x), -(who.y));

    ctx.beginPath(); //Border.
    ctx.fillStyle = "Black";
    ctx.arc(who.x, who.y, who.size, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath(); //Middle.
    ctx.fillStyle = who.color;
    ctx.arc(who.x, who.y, who.size * 0.95, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath(); //Front.
    ctx.strokeStyle = "black";
    ctx.arc(who.x, who.y, who.size * 0.90, 0, Math.PI, false);
    ctx.lineWidth = who.size * 0.15;
    ctx.stroke();

    ctx.resetTransform();
};

//Draw a bullet.
function drawBullet(which) {
    ctx.strokeStyle = "gold";

    let thisX = Math.cos((which.deg + 90) / 180 * Math.PI) * 2500;
    let thisY = Math.sin((which.deg + 90) / 180 * Math.PI) * 2500;

    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(which.x, which.y);
    ctx.lineTo(which.x + thisX * 0.008, which.y + thisY * 0.008);
    ctx.stroke();
};

//Draw wave level.
function drawWaveLevel() {
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.shadowColor = "rgba(0,0,0)";

    ctx.fillStyle = "white";
    ctx.font = "120px Arial";
    ctx.textAlign = "left";
    ctx.fillText(waves.level, canvas.x * (-1) + 80, canvas.y * (-1) + 160);
}

//Draw money.
function drawMoney() {
    let WH = window.innerHeight;
    let WW = window.innerWidth;
    if (map.width < WW) WW = map.width;
    if (map.height < WH) WH = map.height;

    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.shadowColor = "rgba(0,0,0)";

    ctx.fillStyle = "white";
    ctx.font = "50px calibri";
    ctx.textAlign = "right";
    ctx.fillText(me.money + " $", canvas.x * (-1) + WW - 50, canvas.y * (-1) + WH - 45);
}

//Draw edge of map.
function drawEdge(a, b, c, where, opacity) {
    let shadow = opacity;

    let startX;
    let startY;
    let endX;
    let endY;
    if (where == "edge") startX = 0, startY = 0;
    if (where == "edge") endX = map.width, endY = map.height;
    if (where == "view") startX = canvas.x * (-1), startY = canvas.y * (-1);
    if (where == "view") endX = canvas.x * (-1) + window.innerWidth, endY = canvas.y * (-1) + window.innerHeight;

    var gradient = ctx.createLinearGradient(map.height / 2, startY, map.height / 2, endY);
    gradient.addColorStop(0, "rgba(" + a + "," + b + "," + c + "," + shadow + ")");
    gradient.addColorStop(.4, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(.6, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(" + a + "," + b + "," + c + "," + shadow + ")");
    ctx.fillStyle = gradient;
    ctx.fillRect(startX, startY, endX, endY);

    gradient = ctx.createLinearGradient(startX, map.width / 2, endX, map.width / 2);
    gradient.addColorStop(0, "rgba(" + a + "," + b + "," + c + "," + shadow + ")");
    gradient.addColorStop(.4, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(.6, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(" + a + "," + b + "," + c + "," + shadow + ")");
    ctx.fillStyle = gradient;
    ctx.fillRect(startX, startY, endX, endY);
}

//Draw pause.
function drawPause() {
    let WH = window.innerHeight;
    let WW = window.innerWidth;

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, map.width, map.height);

    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.shadowColor = "rgba(0,0,0)";

    ctx.fillStyle = "white";
    ctx.font = "400px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", canvas.x * (-1) + WW / 2, canvas.y * (-1) + WH / 2 + 140);
}

//Draw darkness.
function drawDarkness(ammount) {
    ctx.fillStyle = "rgba(0, 0, 0, " + ammount + ")";

    if (me.flashlight == true) { //Flashlight.
        let point = {};
        point.x = me.flashlightDist * Math.cos((me.deg + 90) / 180 * Math.PI);
        point.y = me.flashlightDist * Math.sin((me.deg + 90) / 180 * Math.PI);

        point.NVX = point.y * -1; //Normalized vektor x
        point.NVY = point.x; //Normalized vektor y

        ctx.beginPath();
        ctx.moveTo(0, 0); //0
        ctx.lineTo(me.x, 0); //1
        ctx.lineTo(me.x, me.y); //2
        ctx.lineTo(me.x + point.x + point.NVX * 0.3, me.y + point.y + point.NVY * 0.3); //3
        ctx.quadraticCurveTo(me.x + point.x * 1.3, me.y + point.y * 1.3, me.x + point.x - point.NVX * 0.3, me.y + point.y - point.NVY * 0.3);
        ctx.lineTo(me.x, me.y); //5
        ctx.lineTo(me.x, 0); //6
        ctx.lineTo(map.width, 0); //7
        ctx.lineTo(map.width, map.height); //8
        ctx.lineTo(0, map.height); //9
        ctx.lineTo(0, 0); //10
        ctx.closePath();
        ctx.fill();

        //Drawing the player ontop of beam.
        drawUnit(me, mouse);

    } else { //No flashlight.
        ctx.fillRect(0, 0, map.width, map.height);
    };
};

//Draw healthbar
//function drawHealthbar() {
//let hpPct = me.hp / me.hpMax;
//let WH = window.innerHeight;
//let WW = window.innerWidth;
//if (map.width < WW) WW = map.width;
//if (map.height < WH) WH = map.height;
//Bottom box
//ctx.fillStyle = "black";
//ctx.fillRect(canvas.x * (-1) + WW * 0.03, canvas.y * (-1) + WH + WW * -0.04, 300, 30);
//Front box
//ctx.fillStyle = "#e80000";
//ctx.fillRect(canvas.x * (-1) + WW * 0.03, canvas.y * (-1) + WH + WW * -0.04, 300 * hpPct, 30);
//};