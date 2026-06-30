const canvas = document.querySelector("canvas");
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const imgSize = 200;
let playerImg;
let enemyImg;
let enemyProjectileImg;
let playerProjectileImg;
let player;
let enemy;

class entity{
    constructor(img,x,y,size,hp,drawMirrored=false,projectile,attack,attackType){
        this.img = img;
        this.x = x;
        this.y = y;
        this.size = size;
        this.hp = hp;
        this.maxHp = hp;
        this.hpText = "";
        this.drawMirrored = drawMirrored;
        this.projectile = projectile;
        this.attack = attack;
        this.projectileSize = 80;
        this.originalX = x;
        this.attackType = attackType;
    }

    draw() {
        // IMAGE + BORDER
        ctx.fillStyle = "royalblue";
        ctx.fillRect(this.x,this.y,this.size,this.size);
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x,this.y,this.size,this.size);

        if (!this.drawMirrored) {
            ctx.drawImage(this.img,this.x+10,this.y+10,this.size-20,this.size-20);
        } else {
            ctx.save();
            ctx.translate(this.x + this.size, this.y);
            ctx.scale(-1, 1);
            ctx.drawImage(this.img, 10, 10, this.size-20, this.size-20);
            ctx.restore();
        };
        
        //HP FILL
        this.hpText = String(this.hp)+"/"+String(this.maxHp);

        let hpBarSize = 0;
        if (this.maxHp <= 0) {
            hpBarSize = 0;
        } else {
            hpBarSize = this.size/(this.maxHp/this.hp);
        };

        ctx.fillStyle = "red";
        ctx.fillRect(this.x,this.y + this.size + 10, hpBarSize, 30);
        
        // HP BORDER + FILL
        ctx.strokeRect(this.x,this.y + this.size + 10, this.size, 30);
        
        // HP TEXT
        ctx.lineWidth = 1;
        ctx.fillStyle = "black";
        ctx.font = "20px Arial ";
        ctx.textAlign="center"; 
        ctx.textBaseline = "middle";
        const metrics = ctx.measureText(this.hpText);      
        const textX = Math.floor(this.x + (this.size)/2);
        const textY = Math.floor(this.y + this.size + 10 + (30)/2);

        ctx.fillText(this.hpText, textX, textY);
    };
};

function loadImage(path) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => resolve(img);

        img.onerror = () => {
            reject(new Error(`Failed to load image: ${path}`));
        };

        img.src = path;
    });
}

async function loadImages() {
    try {
        //player
        playerImg = await loadImage("./images/player/wizard.png");
        playerProjectileImg = await loadImage("./images/projectiles/magicBall.png");

        //enemies
        enemyImg = await loadImage("./images/enemies/goblin.png");
        enemyProjectileImg = await loadImage("./images/projectiles/dagger.png");

        goblinImg = await loadImage("./images/enemies/goblin.png");
        daggerImg = await loadImage("./images/projectiles/dagger.png");

        ghostImg = await loadImage("./images/enemies/ghost.png");


        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

function attackLoop(speed=1) {
    return new Promise(resolve => {
        if (speed == 0) {
            console.log('speed was 0')
            resolve();
            return;
        };
        
        let projectileX = 0;
        if (speed > 0) {
            projectileX = player.x + imgSize - player.projectileSize;
        } else {
            projectileX = enemy.x;
        };
        let returnToOriginalPosition = false;
        let exitLoop = false;
        
        attackInterval = setInterval(() => {
            ctx.clearRect(0,0, canvas.width, canvas.height);
            player.draw();
            enemy.draw();
            
            if (speed > 0) {
                if (player.attackType == "projectile") {
                    projectileX += speed;
                    ctx.drawImage(player.projectile, projectileX, player.y + imgSize - player.projectileSize, player.projectileSize, player.projectileSize);
                    if (projectileX >= enemy.x) {
                        enemy.hp -= player.attack;
                        exitLoop = true;
                    };
                } else {
                    if (!returnToOriginalPosition) {
                        player.x += speed;
                        if (player.x + imgSize >= enemy.x) {
                            enemy.hp -= player.attack;
                            returnToOriginalPosition = true;
                        };
                    } else {
                        player.x -= speed;
                        if (player.x == player.originalX) {
                            exitLoop = true;
                        };
                    };
                };
            } else if (speed < 0) {
                if (enemy.attackType == "projectile") {
                    projectileX += speed;
                    ctx.drawImage(enemy.projectile, projectileX, enemy.y + imgSize - enemy.projectileSize,enemy.projectileSize,enemy.projectileSize);
                    if (projectileX <= player.x + imgSize) {
                        player.hp -= enemy.attack;
                        exitLoop = true;
                    };
                } else {
                    if (!returnToOriginalPosition) {
                        enemy.x += speed;
                        if (enemy.x <= player.x + imgSize) {
                            player.hp -= enemy.attack;
                            returnToOriginalPosition = true;
                        };
                    } else {
                        enemy.x -= speed;
                        if (enemy.x == enemy.originalX) {
                            exitLoop = true;
                        };
                    };
                };
            };

            if (exitLoop) {
                clearInterval(attackInterval);
                ctx.clearRect(0,0, canvas.width, canvas.height);
                player.draw();
                enemy.draw();
                resolve();
            };
        }, 1);
    });
};

function results(message,description,loot) {
    const resultsWidth = 200;
    const resultsHeight = 200;
    const resultsX = Math.floor(canvas.width/2)-Math.floor(resultsWidth/2);
    const resultsY = Math.floor(canvas.height/2)-Math.floor(resultsHeight/2);

    ctx.lineWidth = 3;
    ctx.fillStyle = "slategray";
    ctx.fillRect(Math.floor(canvas.width/2)-Math.floor(resultsWidth/2),Math.floor(canvas.height/2) - Math.floor(resultsHeight/2),resultsWidth,resultsHeight);
    ctx.strokeRect(Math.floor(canvas.width/2)-Math.floor(resultsWidth/2),Math.floor(canvas.height/2) - Math.floor(resultsHeight/2),resultsWidth,resultsHeight);
    
    ctx.fillStyle = "black";
    ctx.fillText(message,resultsX + resultsWidth/2, resultsY + 20);

    ctx.fillText(description,resultsX + resultsWidth/2, resultsY + 50);

    ctx.fillText("You found:",resultsX + resultsWidth/2, resultsY + 110);
    
    if (player.hp > 0) {
        ctx.fillText(loot,resultsX + resultsWidth/2, resultsY + 140);
    } else {
        ctx.fillText("fuck all, you are dead!",resultsX + resultsWidth/2, resultsY + 140);
    }
    ctx.lineWidth = 1;
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main(){
    // LOADING
    const imagesLoaded = await loadImages();
    if (!imagesLoaded) {
        return;
    };

    // CREATE AND RENDER ENTITIES
    player = new entity(playerImg, 10,10,imgSize,200,true,playerProjectileImg,20,"projectile");
    
    const enemyX = canvas.width - player.x - imgSize;
    enemy = new entity(enemyImg,enemyX,player.y,imgSize,100,false,enemyProjectileImg,10,"melee");

    player.draw();
    enemy.draw();

    // ATTACK LOOP
    let speed = -2;
    while (true) {
        speed = -speed;
        await attackLoop(speed);
        
        if (enemy.hp <= 0) {
            results("You won!", "Yay!", "nothing");
            break;
        } else if (player.hp <= 0) {
            results("You died...", "Oops!","not implemented yet");
            break;
        };
        await sleep(1000);
    };
};

main();