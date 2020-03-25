const fs = require('fs'), StringReader = require('../stringReader.js'), Canvas = require('canvas'),
    https = require('https'), httpService = require('../httpService.js'), GIFEncoder = require('gifencoder'),
    { GrDataManager, PDataManager } = require('./../utils/dataManager.js'), utils = require('./../utils/others.js')

module.exports = {
    name: 'clear',
    description: 'Keiko bierze miotłe i sprząta czat!',
    status: 'on',
    aliases: [],
    package: "Admin",
    execute: async (Keiko, msg) => {
        let interpenter = Keiko.interpenter, channel = msg.channel, sub = [], valid = ['s', 'c', 'e', 'ca', 'author', 'all'];
        let embed = new Keiko.Discord.RichEmbed(), user, msgCount = 0, lastMsgId = 0;
        interpenter.skipSpaces();
        let helpWord = Keiko.interpenter.readWord()
        if (helpWord == "help") {
            msg.channel.send(new Keiko.Discord.RichEmbed().setTitle('No siemka tu keiko')
                .addField("Użycie komendy:", `\`keiko!clear <ilość> <gałązka> <reszta>\``)
                .addField("Ogólny opis:", "Usuwam wiadomości zgodnie z zaleceniami")
                .addField("Dodatkowe informacje:", `Zamiast oznaczać użytkownika możesz po prostu wpisać jego id na przykład moje to ${Keiko.user.id}. Jeśli chcesz zobaczyć dostępnę gałązki wpisz \`keiko!clear\` `)
                .addField("Permisje:", "keiko.message.delete"))
        }

        let groups = new GrDataManager().getData(msg.guild.id) || {}, perms = new PDataManager().getData(msg.author.id) || {}, uPerms;
        let groupsArray = Object.keys(groups);
        if (!perms[msg.guild.id]) { perms[msg.guild.id] = { groups: [], perms: { allow: [], deny: [] } } }
        uPerms = perms[msg.guild.id]
        //+ grupy z rang
        if (!utils.hasPerm(uPerms, groupsArray, msg.member, 'keiko.message.delete')) {
            msg.channel.send('Nie ma cię na liście uprawnionych! Albo jestem ślepa...')
            return;
        }
        if (helpWord) Keiko.interpenter.moveByInt(-helpWord.length);
        if (interpenter.getRemaing().length == 0) {
            msg.channel.send(embed.setTitle('Hejka tu Keiko!').addField('Poprawne gałązki to:',
                `- s "<ciąg znaków>" - Zaczynające się określonym ciągiem znaków
                - c "<ciąg znaków>" - Zawierające określony ciąg znaków
                - e "<ciąg zanków>" - Kończące się okreśłonym ciągiem znaków
                - ca - Zawierające załącznik (jakikolwiek)
                - author <oznaczenie / id> - Od autora
                - all - Wszystkie nie ważne co i tak to usunę`)
                .addField("Pro tip #:",
                    "Dodając liczbę po komendzie wyznaczysz ilość jeśli tego nie zrobisz usunę 50 pierwszych wiadomości spełniające dany warunek"))
        } else {
            sub.push(Keiko.interpenter.readInt());
            sub.push(Keiko.interpenter.readWord() || "nieznajdziesztakiegojasiu");
            switch (sub[1]) {
                case 's':
                    sub.push(Keiko.interpenter.readQuotedString());
                    if (sub[0] == 0 || sub[2] == undefined) {
                        msg.channel.send("No sorka ale coś nie tak! Zabrakło ci ilości albo ciągu znaków");
                        return;
                    }
                    msg.delete();
                    sub[0]++;
                    do {
                        await msg.channel.fetchMessages().then(async msgs => {
                            msgs = [...msgs.values()]
                          if(msgs.length == 0) {
                            msgCount = sub[0];
                          } 
                            for (let i = 0; i < msgs.length && msgCount < sub[0]; i++) {
                                if (i == msgs.length - 1) lastMsgId = msgs[i].id;
                                if (msgs[i].cleanContent.startsWith(sub[2])) {
                                    await msgs[i].delete(100);
                                    msgCount++;
                                }
                            }
                        })
                    } while (msgCount < sub[0]);
                    msg.channel.send(`Poprawnie usunięto ${msgCount} wiadomości z tego kanału`)
                    break;
                case "c":
                    sub.push(Keiko.interpenter.readQuotedString());
                    if (sub[0] == 0 || sub[2] == undefined) {
                        msg.channel.send("No sorka ale coś nie tak! Zabrakło ci ilości albo ciągu znaków");
                        return;
                    }
                    msg.delete();
                    sub[0]++;
                    do {
                        await msg.channel.fetchMessages().then(async msgs => {
                            msgs = [...msgs.values()]
                          if(msgs.length == 0) {
                            msgCount = sub[0];
                          } 
                            for (let i = 0; i < msgs.length && msgCount < sub[0]; i++) {
                                if (i == msgs.length - 1) lastMsgId = msgs[i].id;
                                if (msgs[i].cleanContent.includes(sub[2])) {
                                    await msgs[i].delete(100);
                                    msgCount++;
                                }
                            }
                        })
                    } while (msgCount < sub[0]);
                    msg.channel.send(`Poprawnie usunięto ${msgCount} wiadomości z tego kanału`)
                    break;
                case "e":
                    sub.push(Keiko.interpenter.readQuotedString());
                    if (sub[0] == 0 || sub[2] == undefined) {
                        msg.channel.send("No sorka ale coś nie tak! Zabrakło ci ilości albo ciągu znaków");
                        return;
                    }
                    msg.delete();
                    sub[0]++;
                    do {
                        await msg.channel.fetchMessages().then(async msgs => {
                            msgs = [...msgs.values()]
                          if(msgs.length == 0) {
                            msgCount = sub[0];
                          } 
                            for (let i = 0; i < msgs.length && msgCount < sub[0]; i++) {
                                if (i == msgs.length - 1) lastMsgId = msgs[i].id;
                                if (msgs[i].cleanContent.endsWith(sub[2])) {
                                    await msgs[i].delete(100);
                                    msgCount++;
                                }
                            }
                        })
                    } while (msgCount < sub[0]);
                    msg.channel.send(`Poprawnie usunięto ${msgCount} wiadomości z tego kanału`)
                    break;
                case "ca":
                    if (sub[0] == 0) {
                        msg.channel.send("No sorka ale coś nie tak! Zabrakło ci ilości!");
                        return;
                    }
                    msg.delete();
                    sub[0]++;
                    do {
                        await msg.channel.fetchMessages().then(async msgs => {
                            msgs = [...msgs.values()]
                          if(msgs.length == 0) {
                            msgCount = sub[0];
                          } 
                            for (let i = 0; i < msgs.length && msgCount < sub[0]; i++) {
                                if (i == msgs.length - 1) lastMsgId = msgs[i].id;
                                if (msgs[i].attachments.size > 0) {
                                    await msgs[i].delete(100);
                                    msgCount++;
                                }
                            }
                        })
                        msgCount++;
                    
                    } while (msgCount < sub[0]);
                    break;
                case "author":
                    if (sub[0] == 0) {
                        msg.channel.send("No sorka ale coś nie tak! Zabrakło ci ilości!");
                        return;
                    }
                    if (!msg.mentions.users.first()) {
                        let id = Keiko.interpenter.readWord();
                        if (id) {
                            user = await Keiko.fetchUser(id);
                            Keiko.interpenter.moveByInt(-id.length);
                        } else throw "musisz oznaczyć użytkownika albo podać jego id"

                    } else user = msg.mentions.users.first();
                    msg.delete();
                    sub[0]++;
                    do {
                        await msg.channel.fetchMessages().then(async msgs => {
                            msgs = [...msgs.values()]
                          if(msgs.length == 0) {
                            msgCount = sub[0];
                          } 
                            for (let i = 0; i < msgs.length && msgCount < sub[0]; i++) {
                                if (i == msgs.length - 1) lastMsgId = msgs[i].id;
                                if (user.id == msgs[i].author.id) {
                                    await msgs[i].delete(100);
                                    msgCount++;
                                }
                            }
                        })
                    } while (msgCount < sub[0]);
                    break;
                default:
                    if (sub[0] == 0) {
                        msg.channel.send("No sorka ale coś nie tak! Zabrakło ci ilości!");
                        return;
                    }
                    msg.delete();
                    sub[0]++;
                    await msg.channel.fetchMessages().then(async msgs => {
                        msgs = [...msgs.values()]
                        lastMsgId = msgs[0].id;
                    })
                    do {
                        await msg.channel.fetchMessages().then(async msgs => {
                            msgs = [...msgs.values()]
                            for (let i = 0; i < msgs.length && msgCount < sub[0]; i++) {
                                if (i == msgs.length - 1) lastMsgId = msgs[i].id;
                                await msgs[i].delete(100);
                                msgCount++;
                            }
                          if(msgs.length == 0) {
                            msgCount = sub[0];
                          } 
                        })
                    } while (msgCount < sub[0]);
            }
        }
    }
}