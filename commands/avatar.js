const fs = require('fs'), StringReader = require('../stringReader.js'), Canvas = require('canvas'),
    https = require('https'), httpService = require('../httpService.js');

module.exports = {
    name: 'avatar',
    description: 'Pokazuje twór avatar, kogoś innego',
    aliases: [],
    status: 'on',
    execute: async (Keiko, msg) => {
        let embed = new Keiko.Discord.RichEmbed().setTitle('No siemka');
        if (!msg.mentions.users.first()) embed.addField(msg.author.tag, `[Zobacz tutaj](${msg.author.avatarURL})`)
            .setImage(msg.author.avatarURL)
        else embed.addField(msg.mentions.users.first().tag, `[Zobacz tutaj](${msg.mentions.users.first().avatarURL})`)
            .setImage(msg.mentions.users.first().avatarURL)
        msg.channel.send(embed)
        return;
    }
}