const fs = require('fs'), StringReader = require('../stringReader.js'), Canvas = require('canvas'),
    https = require('https'), httpService = require('../httpService.js');

module.exports = {
    name: 'avatar',
    description: 'Pokazuje twór avatar, kogoś innego',
    aliases: [],
    status: 'on',
    execute: async (Keiko, msg) => {
        let embed = new Keiko.Discord.RichEmbed().setTitle('No siemka'), user;
        if (!msg.mentions.users.first()) {
            let id = Keiko.interpenter.readWord();
            if (id) {
                user = await Keiko.fetchUser(id);
                Keiko.interpenter.moveByInt(-id.length);
            } else user = msg.author;
        } else user = msg.mentions.users.first();
        embed.addField(user.tag, `[Zobacz tutaj](${user.avatarURL})`).setImage(user.avatarURL)
        msg.channel.send(embed)
        return;
    }
}