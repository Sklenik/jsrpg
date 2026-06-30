const canvas = document.querySelector("canvas");
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const imgSize = 200;
let playerImg;
let enemyImg;
let kolhiBallImg;
let clawImg;
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
        playerImg = await loadImage("./images/onua.png");
        console.log("loaded onua");

        clawImg = await loadImage("./images/onuaclaws.png");
        console.log("loaded onuaclaws.png");

        enemyImg = await loadImage("./images/VNOLG_Kofo-Jaga.svg");
        console.log("loaded Kofo Jaga");

        kolhiBallImg = await loadImage("./images/Kolhii_Ball.png");
        console.log("loaded Kolhii_Ball.png");

        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

function Attack(speed=1) {
    return new Promise(resolve => {
        if (speed == 0) {
            console.log('speed was 0')
            resolve();
            return;
        };
 
        const rectSize = 40;
        let exitLoop = false;
        
        let rectX = 0;
        if (speed > 0) {
            rectX = player.x+imgSize-rectSize;
        } else {
            rectX = enemy.x;
        };
        
        attackInterval = setInterval(() => {
            ctx.clearRect(0,0, canvas.width, canvas.height);
            player.draw();
            enemy.draw();
            rectX += speed;

            if (speed > 0) {
                ctx.drawImage(player.projectile, rectX,player.y+imgSize-rectSize,rectSize,rectSize);
                if (rectX >= enemy.x) {
                    enemy.hp -= player.attack;
                    exitLoop = true;
                };
            } else if (speed < 0) {
                ctx.drawImage(enemy.projectile, rectX,enemy.y+imgSize-rectSize,rectSize,rectSize);
                if (rectX <= player.x+imgSize) {
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

function results(message,description,loot) {
    const resultsWidth = 200;
    const resultsHeight = 200;
    const resultsX = Math.floor(canvas.width/2)-Math.floor(resultsWidth/2);
    const resultsY = Math.floor(canvas.height/2)-Math.floor(resultsHeight/2);

    ctx.fillStyle = "beige";
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
        await Attack(speed);
        if ((speed > 0) && (enemy.hp <= 0)) {
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

    player = new entity(playerImg, 10,10,imgSize,100,false,clawImg,10);
    
    const enemyX = canvas.width - player.x - imgSize;
    enemy = new entity(enemyImg,enemyX,player.y,imgSize,100,true,kolhiBallImg,10);

    player.draw();
    enemy.draw();

    attackLoop();
};

main();