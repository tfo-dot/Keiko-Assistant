const fs = require('fs'), Canvas = require('canvas'), httpService = require('../httpService.js');

module.exports = {
    name: 'panel',
    description: 'Pokazuje ci twój własny panel! Który możesz dostować na stronie lub na discordzie',
    status: 'on',
    aliases: [],
    execute: async (Keiko, msg) => {
        let canvas = Canvas.createCanvas(500, 500);
        let colors = {
            mainTile: '#56c6c6',
            Tile: '#242529'
        }
        const ctx = canvas.getContext('2d')
        makeRounded(canvas, 5, 5, 490, 160, 20, colors.mainTile);
        makeRounded(canvas, 5, 170, 243, 160, 20, colors.Tile);
        makeRounded(canvas, 252, 170, 243, 160, 20, colors.Tile);
        makeRounded(canvas, 5, 335, 243, 160, 20, colors.Tile);
        makeRounded(canvas, 252, 335, 243, 160, 20, colors.Tile);
        await makeRoundedSquare(canvas, 10, 10, 150, msg.author.avatarURL);
        writeText(canvas, msg.author.tag, 180, 55, canvas.width - 200);
        writeText(canvas, msg.member.displayName, 180, 105, canvas.width - 200);
        let YuiProfile = await Keiko.fetchUser('551414888199618561').then(user => user.avatarURL);
        let YuiData = JSON.parse(await httpService.get('https://yui-discord-bot.glitch.me/levels').then(response => response));
        await makeRoundedSquare(canvas, 10, 175, 30, YuiProfile);
        writeText(canvas, 'Staty Yui', 45, 205, 193, '#fff')
        let dataIndex = YuiData.findIndex(elt => elt.userId == msg.author.id);
        if (dataIndex != -1) {
            writeText(canvas, `Twój poziom: ${YuiData[dataIndex].lvl}`, 10, 235, 243, '#fff');
            writeText(canvas, `XP: ${YuiData[dataIndex].xp} / ${YuiData[dataIndex].lvl * 200}`, 10, 265, 243, '#fff');
            writeText(canvas, `Twoja pozycja: ${dataIndex + 1}`, 10, 295, 243, '#fff');
        } else {
            writeText(canvas, 'No sorka! Ale Yui nie ma nic o tobie w bazie', 10, 235, 243, '#fff')
        }


        let attachment = new Keiko.Discord.Attachment(canvas.toBuffer(), `panel-${msg.author.id}.jpg`)
        msg.channel.send(attachment);
    }
}

async function makeRoundedSquare(canvas, x, y, w, img) {
    let ctx = canvas.getContext('2d');
    ctx.save();
    ctx.beginPath();
    ctx.arc(w / 2 + x, w / 2 + y, w / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    let profilePic = await Canvas.loadImage(img)
    ctx.drawImage(profilePic, x, y, w, w);
    ctx.restore();
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

function makeRounded(canvas, x, y, w, h, radius, color) {
    let ctx = canvas.getContext('2d'), r = x + w, b = y + h
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(r - radius, y);
    ctx.quadraticCurveTo(r, y, r, y + radius);
    ctx.lineTo(r, y + h - radius);
    ctx.quadraticCurveTo(r, b, r - radius, b);
    ctx.lineTo(x + radius, b);
    ctx.quadraticCurveTo(x, b, x, b - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
}