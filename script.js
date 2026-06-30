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
    constructor(img,x,y,size,hp,drawMirrored=false,projectile,attack){
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
    }

    draw(){
        // IMAGE + BORDER
        if (!this.drawMirrored) {
            ctx.drawImage(this.img,this.x+10,this.y+10,this.size-20,this.size-20);
        } else {
            ctx.save();
            ctx.translate(this.x + this.size, this.y);
            ctx.scale(-1, 1);
            ctx.drawImage(this.img, 10, 10, this.size-20, this.size-20);
            ctx.restore();
        };
        ctx.strokeRect(this.x,this.y,this.size,this.size);
        
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
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.textAlign="center"; 
        ctx.textBaseline = "middle";
        const metrics = ctx.measureText(this.hpText);      
        const textX = Math.floor(this.x + (this.size)/2);
        const textY = Math.floor(this.y + this.size + 10 + (30)/2);

        ctx.fillText(this.hpText, textX, textY);
    }
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

function projectileAttack(speed=1) {
    return new Promise(resolve => {
        if (speed == 0) {
            console.log('speed was 0')
            resolve();
            return;
        };
 
        const projectileSize = 80;
        let exitLoop = false;
        
        let projectileX = 0;
        if (speed > 0) {
            projectileX = player.x+imgSize-projectileSize;
        } else {
            projectileX = enemy.x;
        };
        
        attackInterval = setInterval(() => {
            ctx.clearRect(0,0, canvas.width, canvas.height);
            player.draw();
            enemy.draw();
            projectileX += speed;

            if (speed > 0) {
                ctx.drawImage(player.projectile, projectileX,player.y+imgSize-projectileSize,projectileSize,projectileSize);
                if (projectileX >= enemy.x) {
                    enemy.hp -= player.attack;
                    exitLoop = true;
                };
            } else {
                ctx.drawImage(enemy.projectile, projectileX,enemy.y+imgSize-projectileSize,projectileSize,projectileSize);
                if (projectileX <= player.x+imgSize) {
                    player.hp -= enemy.attack;
                    exitLoop = true;
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

function meleeAttack(speed=1) {
    return new Promise(resolve => {
        if (speed == 0) {
            console.log('speed was 0')
            resolve();
            return;
        };
 
        let exitLoop = false;
        let returnToOriginalPosition = false;
        let originalPlayerX = player.x;
        let originalEnemyX = enemy.x;
        
        attackInterval = setInterval(() => {
            
            if (!returnToOriginalPosition) {
                if (speed > 0) {
                    player.x += speed;
                    if (player.x+imgSize >= enemy.x) {
                        enemy.hp -= player.attack;
                        returnToOriginalPosition = true;
                    };
                } else {
                    enemy.x += speed;
                    if (enemy.x <= player.x+imgSize) {
                        player.hp -= enemy.attack;
                        returnToOriginalPosition = true;
                    };
                };
            } else {
                if (speed > 0) {
                    player.x -= speed;
                    if (player.x == originalPlayerX) {
                        exitLoop = true;
                    };
                } else {
                    enemy.x -= speed;
                    if (enemy.x == originalEnemyX) {
                        exitLoop = true;
                    };
                };
            };
            
            ctx.clearRect(0,0, canvas.width, canvas.height);
            player.draw();
            enemy.draw();

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

function projectileVSMeleeAttack(speed=1) {
    return new Promise(resolve => {
        if (speed == 0) {
            console.log('speed was 0')
            resolve();
            return;
        };
 
        const projectileSize = 80;
        let exitLoop = false;
        
        let projectileX = 0;
        if (speed > 0) {
            projectileX = player.x+imgSize-projectileSize;
        } else {
            projectileX = enemy.x;
        };

        let returnToOriginalPosition = false;
        let originalEnemyX = enemy.x;
        
        attackInterval = setInterval(() => {
            projectileX += speed;

            ctx.clearRect(0,0, canvas.width, canvas.height);
            player.draw();
            enemy.draw();

            if (speed > 0) {
                ctx.drawImage(player.projectile, projectileX,player.y+imgSize-projectileSize,projectileSize,projectileSize);
                if (projectileX >= enemy.x) {
                    enemy.hp -= player.attack;
                    exitLoop = true;
                };
            };

            if (!returnToOriginalPosition) {
                if (speed < 0) {
                    enemy.x += speed;
                    if (enemy.x <= player.x+imgSize) {
                        player.hp -= enemy.attack;
                        returnToOriginalPosition = true;
                    };
                };
            } else {
                if (speed < 0) {
                    enemy.x -= speed;
                    if (enemy.x == originalEnemyX) {
                        exitLoop = true;
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
};

async function attackLoop() {
    let speed = -2;
    while (true) {
        speed = -speed;

        // TODO rework and implement attack pattern into entity object, tweak attack function accordingly
        // await projectileAttack(speed);
        // await meleeAttack(speed);
        await projectileVSMeleeAttack(speed);
        
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main(){
    const imagesLoaded = await loadImages();
    if (!imagesLoaded) {
        return;
    };

    player = new entity(playerImg, 10,10,imgSize,200,true,playerProjectileImg,20);
    
    const enemyX = canvas.width - player.x - imgSize;
    enemy = new entity(enemyImg,enemyX,player.y,imgSize,100,false,enemyProjectileImg,10);

    player.draw();
    enemy.draw();

    attackLoop();
};

main();