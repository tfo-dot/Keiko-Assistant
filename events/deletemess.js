const { GDataManager } = require('./../utils/dataManager.js'), Discord = require('discord.js');

module.exports = {
    event: 'messageDelete',
    execute: async (msg) => {
        try {
            let data = new GDataManager().getData(msg.guild.id);
            if (data.logs.delete.enabled) {
                if (data.logs.delete.channel) {
                    let channel = msg.guild.channels.find(channel => channel.id == data.logs.delete.channel);
                    let attachments = msg.attachments;
                    let embed = new Discord.RichEmbed().setTitle('Hejka, tu Keiko!')
                        .addField('Coś się stało!', 'Usunięcie wiadomości', true)
                        .addField('Gdzie?', msg.channel, true).addField('Liczba załączników', msg.attachments.size)
                    .addField('Autor wiadomości', msg.author, true)
                    .addFiled("Ma tekst?", `${msg.cleanContent.length() > 0 ? "Indeed ma tekst": "No jednak nie, pewnie to sam załącznik albo embed"}`)
                    msg.cleanContent.length() > 0 || wrap(msg.cleanContent.replace(/\n/g, "{ITS ENTER}"), 1024).forEach((elt, i) => {
                        embed.addField("Część " + (i + 1), elt.replace(/{ITS ENTER}/g, "\n"))
                    });
                    await channel.send(embed)
                }
            }
        } catch (err) { }
    }
}

function wrap(s, w) {
    s = s.replace(new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1\n')
    return s.split('\n') || s;
} 