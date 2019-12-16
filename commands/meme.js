const fs = require('fs'), StringReader = require('../stringReader.js'), Canvas = require('canvas'),
    https = require('https'), httpService = require('../httpService.js'), GIFEncoder = require('gifencoder');

module.exports = {
    name: 'meme',
    description: 'Tworzy mem na podstawie tekstu, obrazka',
    status: 'on',
    aliases: [],
    execute: async (Keiko, msg) => {
        let name = Keiko.interpenter.readWord(), canvas, user, tekst;
        if (name == 'tvp') {
            tekst = Keiko.interpenter.getRemaing().toUpperCase();
        } else {
            if (!msg.mentions.users.first()) {
                let id = Keiko.interpenter.readWord();
                if (id) {
                    user = await Keiko.fetchUser(id);
                    Keiko.interpenter.moveByInt(-id.length);
                } else user = msg.author;
            } else user = msg.mentions.users.first();
        }
        switch (name) {
            case 'no-bully':
                canvas = Canvas.createCanvas(640, 360);
                await drawBase(canvas, `https://cdn.glitch.com/100c005e-15e4-4ea1-bd04-503ac74cd38e%2Fno-bully.jpg?v=1569058567328`);
                await drawAndClip(canvas, 220, 100, 160, 160, 0, 50, user.avatarURL);
                writeText(canvas, 'Created by Keiko Assistant', 500, 350, 160);
                break;
            case 'chocolate':
                canvas = Canvas.createCanvas(640, 360)
                await drawBase(canvas, `https://cdn.glitch.com/100c005e-15e4-4ea1-bd04-503ac74cd38e%2FChocolate%20but%20better.png?v=1569142644375`);
                await drawAndClip(canvas, 220, 35, 160, 160, 0, 0, user.avatarURL);
                writeText(canvas, 'Created by Keiko Assistant', 500, 350, 160);
                break;
            case 'tvp':
                canvas = Canvas.createCanvas(640, 360);
                await drawBase(canvas, `https://cdn.glitch.com/100c005e-15e4-4ea1-bd04-503ac74cd38e%2Ftvpv2.png?v=1569714858957`)
                let num = calcFont(canvas, tekst, 505).substring(0, 1);
                writeText(canvas, tekst, 110, 317 - (70 - parseInt(num)) / 8, 505, '#fff');
                writeText(canvas, 'Created by Keiko Assistant', 500, 350, 160);
                break;
            case 'frame':
                let image = msg.attachments.first();
                if (!image) {
                    msg.channel.send("No sorka ale musisz dorzucić obrazek!");
                    return;
                }
                canvas = Canvas.createCanvas(10 + image.width, 5 + image.height);
                drawSquare(canvas, 0, 0, canvas.width, canvas.height, '#000');
                await drawAndClip(canvas, 5, 2.5, image.width, image.height, 0, 0, image.url);
                break;
            case 'triggered':
                msg.channel.send('Ta operacja może chwile potrwać, proszę kawkę aby umilić tobie czekanie! :coffee:')
                canvas = Canvas.createCanvas(340, 340);
                let encoder = new GIFEncoder(340, 340);
                encoder.start();
                encoder.setRepeat(0);
                encoder.setDelay(25);
                let ctx = canvas.getContext('2d'), prof = await Canvas.loadImage(user.avatarURL),
                    triggered = await Canvas.loadImage("https://cdn.glitch.com/100c005e-15e4-4ea1-bd04-503ac74cd38e%2Ftriggered.bmp"),
                    filter = await Canvas.loadImage("https://cdn.glitch.com/100c005e-15e4-4ea1-bd04-503ac74cd38e%2Fred.bmp");
                for (let i = 0; i < 10; i++) {
                    let cx = genRandom(-25, 25) - 5, cy = genRandom(-15, 15) - 5;
                    ctx.drawImage(prof, cx, cy, 360, 360);
                    ctx.drawImage(triggered, cx, cy + 300, 360, 60);
                    ctx.drawImage(filter, 0, 0, 360, 360);
                    encoder.addFrame(ctx);
                }
                encoder.finish();
                let attachment = new Keiko.Discord.Attachment(encoder.out.getData(), `meme-${name}.gif`)
                msg.channel.send(attachment);
                return;
            default:
                msg.channel.send(`Dostępne wzory: \n> - no-bully \n> - chocolate\n> - triggered\n> - tvp <text>\n> - frame <Dodaj obrazek>`);
                return;
        }

        let attachment = new Keiko.Discord.Attachment(canvas.toBuffer(), `meme-${name}.jpg`)
        msg.channel.send(attachment);
        return;
    }
}

function calcFont(canvas, text, w) {
    let ctx = canvas.getContext('2d'), fontSize = 70;
    do ctx.font = `${fontSize -= 10}px sans-serif`; while (ctx.measureText(text).width > w);
    return ctx.font;
}

function writeText(canvas, text, x, y, w, color = '#000') {
    let ctx = canvas.getContext('2d');
    ctx.font = calcFont(canvas, text, w);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

async function drawBase(canvas, imgLink) {
    let base = await Canvas.loadImage(imgLink), ctx = canvas.getContext('2d');
    ctx.drawImage(base, 0, 0, canvas.width, canvas.height);
}

async function drawAndClip(canvas, x, y, w, h, w2, h2, imgLink) {
    let picToDraw = await Canvas.loadImage(imgLink), ctx = canvas.getContext('2d');
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w - w2, h - h2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(picToDraw, x, y, w, h);
    ctx.restore();
}

function drawSquare(canvas, x, y, w, h, color) {
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function genRandom(min, max) { return Math.floor(Math.random() * (+max - +min)) + +min; }