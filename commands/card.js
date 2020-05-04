const fs = require('fs'), StringReader = require('../stringReader.js'), Canvas = require('canvas'),
    https = require('https'), httpService = require('../httpService.js'), GIFEncoder = require('gifencoder'),
    { GrDataManager, PDataManager } = require('./../utils/dataManager.js'), utils = require('./../utils/others.js')

module.exports = {
    name: 'card',
    description: 'Tworzę RichEmbed i się nim bawie',
    status: 'on',
    aliases: [],
    package: "default",
    execute: async (Keiko, msg) => {
        if (Keiko.interpenter.readWord() == "help") {
            msg.channel.send(new Keiko.Discord.RichEmbed().setTitle("No hejka tu Keiko!")
                .addField("Użycie komendy:", "`keiko!card`")
                .addField("Ogólny opis", "Tworzę Richembed i się nim bawię")
                .addField("Dodatkowe informacje", "Tym razem nie mam nic do dodania")
                .addField("Permisje:",
                    "Do normalnego korzystania z komendy nie potrzebujesz żadnych specjalnych uprawnień jednak jeśli chcesz wysłać na inny kanał przydatna będzie permisja `keiko.card.send`"));
            return
        }
        let il = true, embed = new Keiko.Discord.RichEmbed().setFooter(`Wygenerowane przez Keiko Assistant`);
        msg.channel.send('To twój embed! Zajęte pola: 0 / 25', embed).then(async msge => {
            do {
                await msg.channel.awaitMessages((m) => m.author == msg.author, { max: 1, time: 300000, errors: ['time'] })
                    .then(collected => {
                        collected = collected.first()
                        let interpenter = new StringReader(collected.content);
                        let sub = [];
                        sub.push(interpenter.readWord())
                        collected.delete()
                        switch (sub[0]) {
                            case 'addField':
                                sub.push(interpenter.readQuotedString())
                                sub.push(interpenter.readQuotedString())
                                if (sub[2].length > 1024) {
                                    utils.wrap(sub[2]).forEach((elt, i) => {
                                        embed.addField(`${sub[1]} ${(i + 1)}`, elt)
                                    });
                                    msge.edit(`To twój embed! Zajęte pola: ${embed.fields.length + 1} / 25`, embed)
                                } else msge.edit(`To twój embed! Zajęte pola: ${embed.fields.length + 1} / 25`, embed.addField(sub[1], sub[2]))
                                break;
                            case 'addBlankField':
                                msge.edit(`To twój embed! Zajęte pola: ${embed.fields.length + 1} / 25`, embed.addBlankField())
                                break;
                            case 'setTitle':
                                sub.push(interpenter.readQuotedString());
                                msge.edit(`To twój embed! Zajęte pola: ${embed.fields.length + 1} / 25`, embed.setTitle(sub[1]))
                                break;
                            case 'setDesc':
                                sub.push(interpenter.readQuotedString());
                                msge.edit(`To twój embed! Zajęte pola: ${embed.fields.length + 1} / 25`, embed.setDescription(sub[1]))
                                break;
                            case 'send':
                                let groups = new GrDataManager().getData(msg.guild.id) || {}, perms = new PDataManager().getData(msg.author.id) || {}, uPerms;
                                if (!perms[msg.guild.id]) { perms[msg.guild.id] = { groups: [], perms: { allow: [], deny: [] } } }
                                uPerms = perms[msg.guild.id]
                                if (!utils.hasPerm(uPerms, Object.keys(groups), msg.member, 'keiko.card.send')) {
                                    msg.channel.send('Nie ma cię na liście uprawnionych! Albo jestem ślepa...')
                                    return;
                                }
                                collected.mentions.channels.first().send(embed)
                                msg.channel.send("Wysłano!");
                                il = false;
                                break;
                            case 'done':
                                msg.channel.send("Zakończono!");
                                il = false;
                                break;
                            case 'help':
                            default:
                                msg.channel.send(new Keiko.Discord.RichEmbed().setTitle('Hejka tu Keiko!')
                                    .addField('Pomoc:', `addField "tytuł" "zawartość" - Dodaje nowe pole (max 25)
                                addBlankField - Dodaje nowe puste pole
                                setTitle "tytuł" - Tytuł "kartki"
                                setDesc "opis" - Dodaje opis do "kartki"
                                send #kanał - Wysyła "kartkę" na określony kanał\ndone - kończy edycje`))
                                break;
                        }
                    })
            } while (il)
            msge.delete()
            msge.channel.send(embed)
        })
    }
}