const fs = require('fs'), StringReader = require('../stringReader.js'), Canvas = require('canvas'),
    https = require('https'), httpService = require('../httpService.js'),
    BattleManager = require('../utils/dataManager').BattleManager, utils = require('../utils/others'), cards = utils.getCards();

module.exports = {
    name: 'battle',
    description: 'Walka pomiędzy użytkownikami',
    aliases: [],
    status: 'unstable',
    package: "default",
    execute: async (Keiko, msg) => {
        let helpWord = Keiko.interpenter.readWord(), dataObj = new BattleManager() || [], people = [], user, data, embed = new Keiko.Discord.RichEmbed().setTitle('No siemka');
        data = dataObj.data;
        if (helpWord == "help") {
            msg.channel.send(embed.addField("Użycie komendy:", `\`keiko!battle [uzytkownik]\``)
                .addField("Ogólny opis:", "Walka karciana z innym użytkownikiem")
                .addField("Dodatkowe informacje:", `Zamiast oznaczać użytkownika możesz po prostu wpisać jego id na przykład moje to ${Keiko.user.id}`)
                .addField("Permisje:", "Żadne, do wywołania tej komendy nie są potrzebne żadne specjalne uprawnienia"))
            return
        }
        if (helpWord == "clear" && msg.author.id == "344048874656366592") {
            dataObj.update([]);
            msg.reply("No cyk resecik był");
            return;
        }
        if (helpWord) Keiko.interpenter.moveByInt(-helpWord.length);
        data.map(elt => people.push(...elt.users));
        if (people.find(elt => elt == msg.author.id)) {
            msg.reply("no sorka ale już walczysz najpierw skończ poprzednią walkę!");
        } else {
            if (!msg.mentions.members.first()) {
                let id = Keiko.interpenter.readWord();
                if (id) {
                    user = await Keiko.fetchUser(id);
                    Keiko.interpenter.moveByInt(-id.length);
                }
            } else user = msg.mentions.members.first();
            if (!user) {
                msg.reply("a oznaczenie to gdzie? Sam chcesz zagrać?")
                return;
            } else {
                if (user.user.bot) {
                    msg.reply("czy ty właśnie chciałeś zagrać z botem? Nie w tej bajce, mój koleżko!")
                    return;
                } else {
                    if (user.id == msg.author.id) {
                        msg.reply("nie mów mi że nie masz z kim zagrać...");
                        return;
                    }
                    if (people.find(elt => elt == user.id)) {
                        msg.reply("ten użytkownik już walczy!");
                        return;
                    }

                    msg.channel.send(user, embed.addField("Zareaguj jakąkolwiek na reakcją aby potwierdzić pojedynek", "Spokojnie! Masz 30 sekund na reakcje")).then(msge => {
                        msge.awaitReactions((reaction, userReacting) => userReacting.id == user.id, { time: 30000, max: 1 }).then((collected) => {
                            let hp = {}, stamina = {}, effects = {};
                            hp[msg.author.id] = 20;
                            hp[user.id] = 20;
                            stamina[msg.author.id] = 10;
                            stamina[user.id] = 10;
                            effects[msg.author.id] = [];
                            effects[user.id] = [];
                            let fight = {
                                ids: {
                                    guild: msg.guild.id,
                                    channel: msg.channel.id,
                                    message: msg.id,
                                },
                                users: [msg.author.id, user.id],
                                cards: [[...getStarterCards()], [...getStarterCards()]],
                                stats: {
                                    hp, stamina, round: 0, effects, turn: utils.genRandom(0, 2)
                                }
                            }
                            embed = new Keiko.Discord.RichEmbed().setTitle('No siemka')
                            msge.edit(embed.addField(`Zaczyna: `, `<@${fight.users[fight.stats.turn]}>, zobacz wiadomość prywatną! Gdy tylko w walce coś się zmieni poniżej zostaną pokazane statystyki (hp, stamina oraz liczba kart) oraz wynik walki!`))
                            embed = new Keiko.Discord.RichEmbed().setTitle('No siemka');
                            if (fight.stats.turn == 0) {
                                msg.author.send(embed.addField("Statystyki",
                                    `Twoje HP i stamina: ${fight.stats.hp[fight.users[fight.stats.turn]]}, ${fight.stats.stamina[fight.users[fight.stats.turn]]}\n` +
                                    `HP i stamina wroga: ${fight.stats.hp[fight.users[1 - fight.stats.turn]]}, ${fight.stats.stamina[fight.users[1 - fight.stats.turn]]}\n` +
                                    `Tura: ${fight.stats.round + 1}\n` + `Masz ${fight.cards[fight.stats.turn].length} kart a twój przeciwnik ma ich ${fight.cards[1 - fight.stats.turn].length}`).addField("Karty:", "Wpisz `bt!cards` żeby zobaczyć swoje karty!")
                                    .addField("Dodatkowe informacje #1:", `- Po zakończeniu 10 rundy automatycznie wygra osoba z większą ilością HP`)
                                    .addField("Dodatkowe informacje #2:", `- W ciągu rundy możesz rzucić maksymalnie 2 spelle `)
                                    .addField("Dodatkowe informacje #3:", "- Aby uzyskać dodatkowe informacje skorzystaj z `bt!help`"));
                            } else {
                                user.send(embed.addField("Statystyki",
                                    `Twoje HP i stamina: ${fight.stats.hp[fight.users[fight.stats.turn]]}, ${fight.stats.stamina[fight.users[fight.stats.turn]]}\n` +
                                    `HP i stamina wroga: ${fight.stats.hp[fight.users[1 - fight.stats.turn]]}, ${fight.stats.stamina[fight.users[1 - fight.stats.turn]]}\n` +
                                    `Tura: ${fight.stats.round + 1}\n` + `Masz ${fight.cards[fight.stats.turn].length} kart a twój przeciwnik ma ich ${fight.cards[1 - fight.stats.turn].length}`).addField("Karty:", "Wpisz `bt!cards` żeby zobaczyć swoje karty!")
                                    .addField("Dodatkowe informacje #1:", `- Po zakończeniu 10 rundy automatycznie wygra osoba z większą ilością HP`)
                                    .addField("Dodatkowe informacje #2:", `- W ciągu rundy możesz rzucić maksymalnie 2 spelle `)
                                    .addField("Dodatkowe informacje #3:", "- Aby uzyskać dodatkowe informacje skorzystaj z `bt!help`"));
                            }
                        })
                    })
                }

            }
        }
    }
}

//Efekty
/*
0: Clear
1: Obiżenie ataku na jedną ture
2: Krwawienie (po zakończeniu tury zabiera x hp)
3: Stun na x tur
4: Bariera
5: Obniżenie kosztu o x
*/

function getStarterCards() {
    let spells = cards.filter(elt => elt.type == "spell" || elt.type == "switch");
    let attack = cards.filter(elt => elt.type == "attack");
    return [attack[utils.genRandom(0, attack.length)], attack[utils.genRandom(0, attack.length)], attack[utils.genRandom(0, attack.length)], spells[utils.genRandom(0, spells.length)]]
}