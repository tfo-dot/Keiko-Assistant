const { GDataManager } = require('./../utils/dataManager.js'), Discord = require('discord.js');

module.exports = {
    event: 'messageUpdate',
    execute: async (oldmsg, newmsg) => {
        try {
            let data = new GDataManager().getData(oldmsg.guild.id);
            if (data.logs.edit.enabled) {
                if (data.logs.edit.channel) {
                    let oldc = oldmsg.cleanContent;
                    let newc = newmsg.cleanContent;
                    let channel = oldmsg.guild.channels.find(channel => channel.id == data.logs.edit.channel)
                    channel.send(new Discord.RichEmbed().setTitle('Hejka, tu Keiko!')
                        .addField('Coś się stało!', 'Edycja wiadomości', true).addField('Kiedy?', newmsg.editedAt.toDateString(), true)
                        .addField('Gdzie?', oldmsg.channel, true).addField('Kto?', oldmsg.author, true)).then(() => {
                            channel.send('To stara:');
                            wrap(oldc, 1990).forEach(elt => { channel.send(`\`\`\`${elt}\`\`\``) });
                            channel.send('To nowa:');
                            wrap(newc, 1990).forEach(elt => { channel.send(`\`\`\`${elt}\`\`\``) });
                        })

                }
            }
        } catch (err) { }
    }
}

function wrap(s, w) {
    s = s.replace(new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1\n')
    return s.split('\n');
} 