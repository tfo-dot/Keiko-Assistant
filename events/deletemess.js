const { GDataManager } = require('./../utils/dataManager.js'), Discord = require('discord.js');

module.exports = {
    event: 'messageDelete',
    execute: async (msg) => {
        try {
            let data = new GDataManager().getData(msg.guild.id);
            if (data.logs.delete.enabled) {
                if (data.logs.delete.channel) {
                    let channel = msg.guild.channels.find(channel => channel.id == data.logs.delete.channel);
                    channel.send(new Discord.RichEmbed().setTitle('Hejka, tu Keiko!')
                        .addField('Coś się stało!', 'Usunięcie wiadomości', true)
                        .addField('Gdzie?', msg.channel, true).addField('Autor wiadomości', msg.author, true)).then(() => {
                            channel.send('Wiadomość:')
                            wrap(msg.cleanContent, 1990).forEach(elt => { channel.send(`\`\`\`${elt}\`\`\``) });
                        })
                }
            }
        } catch (err) {}
    }
}

function wrap(s, w) {
    s = s.replace(new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1\n')
    return s.split('\n') || s;
} 